---
name: add-music
description: Add the new music files the Game designer dropped into assets/music/ to the Soundtrack, naming each after the title its source gave it, recording it and its source in the music README, and pushing only that change from the main local clone.
---

# Add music

Use this skill when the Game designer has put new music files into `assets/music/` and wants them in the Soundtrack,
e.g. "I added two more music tracks to slurp up".

The Soundtrack is owned by the [Music](../../../docs/specs/design/ui/music.md#soundtrack) specification, and the file
names and sources by [the music README](../../../assets/music/README.md). Both win when this skill
disagrees with them. Read the Soundtrack section of Music and the whole README before changing anything; they are the
only specifications this skill reads.

This skill adds Tracks only. It never changes a specification: whenever adding the files would need any change beyond
new Track files, their track records, and new README entries, it blocks and tells the designer, so that the change
goes through the `apply-designer-feedback` skill instead.

## Where it works

The skill works directly in the main local clone of the Spec repo, e.g. `repos/game-v5/`, never in a worktree, because
that is where the designer drops the files. Other sessions may have uncommitted work there. The skill leaves all of it
untouched: it never stages, commits, stashes, resets, restores, or deletes a file it did not create or rename, and
never runs a command that rewrites files outside `assets/music/`, e.g. `npm run fix` or `npm run format`.

Its own work is exactly these paths: each new music file, the name it is given when that differs, its `.yaml` track
record when it writes one, and `assets/music/README.md`.

## Workflow

1. **Check the clone.** In the main local clone, run `git fetch origin`, `git branch --show-current`, and
   `git status --porcelain --untracked-files=all`. Block when:
   - the branch is not `main`;
   - `main` has commits that `origin/main` lacks, since pushing would publish another session's commits;
   - any tracked file under `assets/music/` is changed, staged, or deleted, e.g. the README is modified, since that is
     another session's music work in progress.

   Then run `git merge --ff-only origin/main`. Uncommitted work elsewhere does not stop it unless it touches a file
   the incoming commits change; when the merge refuses, block and name the files Git lists. Record every other
   uncommitted or untracked path outside `assets/music/` for the report.

2. **Find the new files.** The new files are the untracked files directly in `assets/music/`, other than `.yaml`
   track records. Block when there are none, or when one is in a subdirectory, since a Track is a file directly in
   the directory.

3. **Determine each file's source and original title**, following the README's sections on sources:
   - The source is named by the designer's request, e.g. "made with Suno v6 on suno.com", or follows from the file
     name matching a convention the README records, e.g. underscores for spaces in an ElevenLabs download. When
     neither settles it, block and ask the designer for the source.
   - The original title is the title the source shows for the song. Derive it from the file name without its
     extension, changed only as the README's section for that source says, e.g. underscores read as spaces for
     ElevenLabs.
   - A source the README has no section for is still a plain addition: add a section for it, worded like the existing
     ones, giving where the tracks were made and how their original titles relate to their file names.

4. **Check each new file.** Block, naming every file that fails, when any:
   - has an extension that the Soundtrack section of Music does not list. Read the list from the specification, never
     from memory. Suggest exporting the track as MP3, which every music source used so far can produce;
   - is larger than 7 MB (7 × 1024 × 1024 bytes). Suggest MP3, e.g. a 34 MB WAV from Suno is about 4 MB as MP3;
   - is byte-for-byte identical to a Track already in `assets/music/`, e.g. the same export dropped in twice;
   - has the same original title as the file name of a row of the README table, without its extension, which also
     lists excluded tracks whose files are gone, or as another new file. Suggest renaming the song in its source, e.g. adding "var2", and downloading it
     again, so that the name stays the same in the source and here.

   When any file blocks, change nothing, not even for the files that pass, so that the designer fixes the set and
   reruns the skill.

5. **Name and record.**
   - Each file's name is its original title plus its extension, e.g. `Silent Threat Protocol.opus`. When the file
     name differs, rename it with a plain move, e.g. `mv`, then confirm that no file under its download name remains
     in `assets/music/`.
   - In the README, add one table row per file, with its file name and source, after the other rows of its source in
     natural order of file name, so that, e.g., "var1" comes before "var2" and "track 2" before
     "track 10". Update the section of each source the new files come from when it lists its files. Change nothing
     else in the README.
   - When the designer gives a file's prompt, or its source keeps it, write its track record, the `.yaml` file with
     the same name, with the fields the existing records use, as the README's Track records section describes; copy
     the prompt word for word.
   - Format only the README, with `npx prettier --write assets/music/README.md`, and review its diff.

6. **Check.** Run `npm run check`. When it fails only in files the skill did not touch, e.g. another session's
   half-finished specification, record that for the report and continue. When it fails in the README, fix it. The Git
   hooks check the whole working tree, so another session's work can still make the commit or push fail in step 7 or 8. Never bypass them with `--no-verify`; when a hook fails, stop and report, leaving the files and README in place
   and any commit unpushed.

7. **Commit only this work.** Stage exactly the skill's paths:
   `git add -- <each new file and track record> assets/music/README.md`. Commit with those paths as the pathspec,
   `git commit -m "<message>" -- <the same paths>`, so that nothing another session staged is committed. The message
   names the new tracks, e.g. "Add Suno v6 tracks Signal Intercept var1 and var2", and ends with the attribution lines
   the session requires. Then run `git show --stat HEAD` and confirm that the commit holds only those paths.

8. **Push** with `git push origin main`. When it is rejected because `origin/main` moved, run `git fetch origin`, and:
   - when `git status --porcelain --untracked-files=no` prints nothing, run `git rebase origin/main`, rerun step 6,
     and push again;
   - otherwise another session's uncommitted changes stop a rebase; never stash or autostash them. Stop and report
     that the commit is made but not pushed, and why.

   After a push, confirm with `git fetch origin` and `git merge-base --is-ancestor HEAD origin/main`.

## Report

Tell the designer:

- each new track's file name, and the download name it had when that differed, with its source and whether it has a
  track record;
- the commit link, in the form `https://github.com/konrad-jamrozik/game-v5/commit/<full-sha>`, or why the work was not
  committed or pushed;
- every uncommitted or untracked path outside the skill's work that was observed and left untouched, grouped by
  directory, or that there was none;
- on a block, every reason, each with what the designer should do, e.g. export the track as MP3 and drop it in again;
- that the next step is to run the `update-implementation` skill, which copies the new Tracks into the Implementation.
