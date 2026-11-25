"""Fix the tags of music tracks: the title is the file name, and no artist is set.

Usage, from the repository root:

    python lib/track-tags/track-tags.py [--dry-run | --check] PATH [PATH ...]

Each PATH is a track file or a folder, searched recursively, e.g. assets/music/tracks.
Requires Python 3 with mutagen (pip install mutagen).

For every .mp3, .opus, and .ogg file, the tool:

- sets the title to the file name without its extension, e.g. "Dark Omen.mp3" gets the
  title "Dark Omen";
- removes every artist tag, i.e. contributing artist, album artist, conductor, and
  remixer in ID3, and ARTIST, ALBUMARTIST, and PERFORMER in Vorbis comments.

Every other tag, e.g. a Suno song URL, comment, cover image, or C2PA manifest, and the
audio itself are kept unchanged. A file already correct is not written.

--dry-run prints what would change and writes nothing.
--check  writes nothing and exits with status 1 when any file would change.
"""

import argparse
import sys
from pathlib import Path

from mutagen.id3 import ID3, TIT2, ID3NoHeaderError
from mutagen.oggopus import OggOpus
from mutagen.oggvorbis import OggVorbis

EXTENSIONS = {".mp3", ".opus", ".ogg"}
ID3_ARTIST_FRAMES = ("TPE1", "TPE2", "TPE3", "TPE4")
VORBIS_ARTIST_KEYS = ("artist", "albumartist", "album artist", "performer")


def find_tracks(paths):
    for path in paths:
        if path.is_dir():
            yield from sorted(p for p in path.rglob("*") if p.suffix.lower() in EXTENSIONS)
        elif path.suffix.lower() in EXTENSIONS:
            yield path
        else:
            raise SystemExit(f"Not a track or folder: {path}")


def fix_mp3(path, title, write):
    try:
        tags = ID3(path)
    except ID3NoHeaderError:
        tags = ID3()
    changes = []
    old_title = tags["TIT2"].text if "TIT2" in tags else None
    if old_title != [title]:
        changes.append(f"title {format_value(old_title)} -> {title!r}")
        tags.setall("TIT2", [TIT2(encoding=3, text=[title])])
    for frame in ID3_ARTIST_FRAMES:
        if frame in tags:
            changes.append(f"remove {frame} {format_value(tags[frame].text)}")
            tags.delall(frame)
    if changes and write:
        # Keep the ID3 version the file had, since Windows Explorer reads v2.3 best.
        version = tags.version[1] if tags.version[1] in (3, 4) else 3
        tags.save(path, v1=1, v2_version=version)
    return changes


def fix_vorbis(path, title, write, kind):
    audio = kind(path)
    if audio.tags is None:
        audio.add_tags()
    tags = audio.tags
    changes = []
    old_title = tags.get("title")
    if old_title != [title]:
        changes.append(f"title {format_value(old_title)} -> {title!r}")
        tags["title"] = [title]
    for key in VORBIS_ARTIST_KEYS:
        if key in tags:
            changes.append(f"remove {key.upper()} {format_value(tags[key])}")
            del tags[key]
    if changes and write:
        audio.save()
    return changes


def format_value(value):
    if value is None:
        return "(none)"
    return repr(value[0]) if len(value) == 1 else repr(list(value))


def fix(path, write):
    title = path.stem
    suffix = path.suffix.lower()
    if suffix == ".mp3":
        return fix_mp3(path, title, write)
    if suffix == ".opus":
        return fix_vorbis(path, title, write, OggOpus)
    return fix_vorbis(path, title, write, OggVorbis)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", help="print the changes, write nothing")
    mode.add_argument("--check", action="store_true", help="exit 1 when any file would change")
    parser.add_argument("paths", nargs="+", type=Path, help="track files or folders")
    args = parser.parse_args()

    write = not (args.dry_run or args.check)
    tracks = list(find_tracks(args.paths))
    changed = 0
    for path in tracks:
        changes = fix(path, write)
        if changes:
            changed += 1
            print(path)
            for change in changes:
                print(f"    {change}")
    verb = "Fixed" if write else "Would fix"
    print(f"{verb} {changed} of {len(tracks)} tracks.")
    if args.check and changed:
        sys.exit(1)


if __name__ == "__main__":
    main()
