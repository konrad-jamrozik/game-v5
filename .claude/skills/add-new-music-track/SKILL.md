---
name: add-new-music-track
description: Bring the Soundtrack tracks the Game designer added in the last 24 hours into order and deploy them. For each new file in assets/music/tracks/, complete its track record, filling every gap it can, e.g. its serial ID and the final prompt from Suno, back the file up to the designer's OneDrive music folder, push it, and deploy it to the Implementation through the apply skill.
---

# Add a new music track

Use this skill when the Game designer has added new music, e.g. "I added the cello tracks" or "/add-new-music-track". The designer generates each song, downloads it into `assets/music/tracks/`, and may write its record; this skill puts each new track in order and deploys it.

The Soundtrack is owned by the [Music](../../../docs/specs/design/ui/music.md#soundtrack) specification, the file names, track records, and sources by [the music README](../../../assets/music/README.md), and the prompt codes by the Prompt codes section of [the music taxonomy](../../../assets/music/music-taxonomy.md#prompt-codes). All three win when this skill disagrees with them; read them before changing anything.

The skill works in the Spec repo's main local clone, e.g. `repos/game-v5/`, where the designer drops the files. Other sessions may have uncommitted work there, which the skill leaves untouched: it never stages, commits, stashes, resets, or deletes a file outside its own track files, their records, `assets/music/README.md`, and `assets/music/music-taxonomy.md`. When another session's work is in its way, it follows [Session coordination](../session-coordination.md).

## Workflow

1. **Find the new tracks.** In the main local clone, run `git fetch origin`, check that it is on `main`, and run `git merge --ff-only origin/main`. A new track is a music file in `assets/music/tracks/` that is untracked or that a commit of the last 24 hours added, e.g. as `git log --since=24.hours --diff-filter=A --name-only -- assets/music/tracks/` lists. When there is none, tell the designer and stop. A file with an extension the Soundtrack section of Music does not list, or larger than 7 MB, cannot be deployed: name it, suggest MP3, and leave it out.
2. **Check each track's record.** Its record is `assets/music/yaml/<track name>.yaml`, or a draft of that name in `assets/music/yaml/drafts/`, which moves into `assets/music/yaml/` with `git mv`. The record is in order when it holds every required key of the README's Track records section, no value is `TODO`, it has no `# DRAFT` line, and the README's table has the track's row.
3. **Fill the gaps.** For each gap, in this order:
   - from the song's source, e.g. for a Suno song every value the README's [Reading Suno song data](../../../assets/music/README.md#reading-suno-song-data) section lists, including `final_prompt_from_gen_tool`, read from the clip API with the `<id>` from the record's `song_url` or from the MP3's ID3 tags;
   - from the other records: the `serial_id`, the next number after the highest any record holds, the new tracks in the order of `created`; the `prompt_code` and `variant`, as the Track records section describes; and a new segment in the Prompt codes section for a source, model, stem, or adjustment that has none;
   - from the designer, in one question, only what neither gives, e.g. the `meta_prompt_taxonomy` or the prompt submitted to a source whose data the skill cannot read. A track with no record gets one written from all of these.

   Where the source's data differs from a value the designer wrote, follow the source and report it. Add the track's row to the README's table, in order of `serial_id`, and format only the two music files with `npx oxfmt --write assets/music/README.md assets/music/music-taxonomy.md`.

4. **Back up the track.** First fix its tags with `python lib/track-tags/track-tags.py <file>`, as [Track tags](../../../lib/track-tags/README.md) describes. Then check the designer's music backup, `C:\Users\spawa\OneDrive\personal\projects\ufo_game\music\`, in the folder its `README.md` gives for the track's source, e.g. `suno/`: when it holds no byte-for-byte copy of the file, by SHA-256, copy the file there and check the copy. When the backup cannot be reached, stop and report before committing.
5. **Publish the tracks.** Run `npm run check`; a failure only in another session's files is recorded for the report, a failure in the skill's files is fixed. Commit exactly the skill's paths, with them as the pathspec of both `git add -A --` and `git commit -m "<message>" --`, so that nothing another session staged is committed, e.g. "Add Suno v6 tracks Night Watch A and B". Run `git show --stat HEAD` to confirm it holds only those paths, then `git push origin main`. Never bypass a Git hook with `--no-verify`.
6. **Deploy to the Implementation** with the `apply` skill, in Go mode, asking it to bring the Implementation up to date with the Spec repo commit just pushed, which adds the new tracks to the game.

## Report

Tell the designer:

- each new track, its `serial_id`, `prompt_code`, and `variant`, and each new segment;
- 🔍 each value the skill filled in, with where it came from, and each value of the designer's that the source contradicted;
- each file copied into the backup, or that it was already there;
- the Spec repo commit link, in the form `https://github.com/konrad-jamrozik/game-v5/commit/<full-sha>`, and the `apply` skill's report;
- every file left out, with why and what to do, e.g. export it as MP3.
