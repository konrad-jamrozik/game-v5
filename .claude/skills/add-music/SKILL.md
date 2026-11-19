---
name: add-music
description: Plan, add, and deploy new Soundtrack tracks. From the Game designer's description of the stem, adjustments, source, and model, draft each track's record with its name and the steps to generate it; once the designer has dropped the generated files into assets/music/tracks/, check them, complete the records and the music README, push from the main local clone, and refresh the Implementation's content.
---

# Add music

Use this skill when the Game designer wants new music in the Soundtrack, e.g. "let's try SCNP, darker, with cello and double bass, on Suno v6", or says the files of an earlier draft are in place, e.g. "I uploaded the cello tracks".

The Soundtrack is owned by the [Music](../../../docs/specs/design/ui/music.md#soundtrack) specification, and the file names, sources, and track records by [the music README](../../../assets/music/README.md). Both win when this skill disagrees with them. Read the Soundtrack section of Music and the whole README before changing anything; they are the only specifications this skill reads.

The skill runs in three phases: [Draft](#phase-1-draft) the tracks and tell the designer how to generate them, wait while the designer generates and downloads them, then [Deploy](#phase-2-deploy) the files to the Spec repo and [Refresh the Implementation](#phase-3-refresh-the-implementation). When the skill starts, it finds where it stands from the working tree: draft records in `assets/music/yaml/` whose files are now in `assets/music/tracks/` resume at Phase 2; otherwise it starts at Phase 1.

This skill adds Tracks only. It never changes a specification: whenever adding the tracks would need any change beyond new Track files, their track records, new README entries and naming codes, and the take letter an existing track gains under [Name the tracks](#phase-1-draft), it blocks and tells the designer, so that the change goes through the `apply-designer-feedback` skill instead.

## Where it works

The skill works directly in the main local clone of the Spec repo, e.g. `repos/game-v5/`, never in a worktree, because that is where the designer drops the files. Other sessions may have uncommitted work there. The skill leaves all of it untouched: it never stages, commits, stashes, resets, restores, or deletes a file it did not create or rename, and never runs a command that rewrites files outside `assets/music/`, e.g. `npm run fix` or `npm run format`.

Its own work is exactly these paths: each draft record it writes in `assets/music/yaml/` and the music file of the same name in `assets/music/tracks/`, `assets/music/README.md`, and, for an existing track that gains a take letter, its file, its record, every record that names it, and `content/music/music_parameters.yaml` when it names it.

## Phase 1: Draft

1. **Check the clone.** In the main local clone, run `git fetch origin`, `git branch --show-current`, and `git status --porcelain --untracked-files=all`. Block when:
   - the branch is not `main`;
   - `main` has commits that `origin/main` lacks, since pushing would publish another session's commits;
   - any tracked file under `assets/music/` is changed, staged, or deleted, e.g. the README is modified, or any file is untracked there, since that is another session's music work in progress, unless it is this skill's own earlier draft, which the designer is now replacing.

   Then run `git merge --ff-only origin/main`. Uncommitted work elsewhere does not stop it unless it touches a file the incoming commits change; when the merge refuses, block and name the files Git lists.

2. **Settle the description.** The designer gives the stem, the adjustments, the source, and the model, e.g. "SCNP, Dark, instruments cello + double bass, Suno v6". Take from the README what each means: a stem or adjustment named by its code reads as that code's `meta_prompt_taxonomy` entry, and the source's README section tells how it is used. Ask, in one question, only for what the description and the README leave open, e.g. a source the README has no section for. Where the designer has not said, choose and report as a decision to review:
   - the number of takes: one generation, i.e. as many songs as the source makes per generation, e.g. two for Suno and for ElevenLabs Music;
   - the source's settings, e.g. Suno's Instrumental switch, sliders, and Exclude styles: those of the latest track of the same line, i.e. the same stem and the most adjustments in common, adjusted only where the new adjustments need it, e.g. an Exclude styles entry that would forbid a requested instrument;
   - the prompt: the skill writes it from the stem and adjustments, in the style and length of that latest track's prompt and within the source's limits the README records, e.g. v03ai's 1,000 characters. When the designer supplies a prompt, e.g. one ChatGPT wrote, use it word for word instead.

3. **Name the tracks** under the README's Naming scheme, from their records, e.g. `S6 SCNP+Dark+Cello&DBass A` and `B`. A source, model, stem, or adjustment with no code yet gets a new code; propose it to the designer. Check each name against the scheme's Windows file name limits. Take letters cover every kept track with that name, the new and the existing ones, in the order of `created`, as the scheme's Take rule says; when an existing kept track would gain or change its letter, e.g. a lone track gains `A`, propose that rename too; it happens in Phase 2.

4. **Write the draft records.** For each take, write its track record, the `.yaml` file with the take's name in `assets/music/yaml/`, as the README's Track records section describes, with every value already known:
   - `file`: the take's name with the extension the source downloads, e.g. `.mp3` for Suno, which must be one the Soundtrack section of Music lists. Read the list from the specification, never from memory;
   - `source`, `model` as far as known, `instrumental`, `instruments`, `meta_prompt_taxonomy`, `prompt`, `exclude_styles`, and `control_sliders`;
   - `original_title`: the take's name itself, e.g. `S6 SCNP+Dark+Cello&DBass A`, which the designer gives the song in the source, so that it finds one song there and the download is named after the take;
   - `variation_of`: for each take after the first of one generation, the first take's file;
   - `prompt_from`: when the skill wrote the prompt, `tool: Claude Code` and, as `meta_prompt`, the designer's request word for word; when the designer supplied the prompt, how it was written, as they tell it, asking for their request to the chatbot when they have not given it.

   Every value only the source can give, e.g. `song_url`, `created`, `tags`, `length`, `bpm`, and the full `model` label, is written as `TODO`, and the record starts with the comment line `# DRAFT: TODO values are filled in from the source after generation.` Run no commit: the drafts stay untracked until Phase 2.

5. **Tell the designer what to do**, as one numbered list per source, then stop and wait for them to confirm that the files are in place. Send it with `send_to_user` when the tool is available, so that it reaches them whole:
   - where to generate, e.g. suno.com with Suno v6 selected;
   - every setting to enter, as the source's UI labels it, e.g. Instrumental on, Weirdness 40%, Style influence 70%, Variety Off, Max Mode Off, Personalize Off, Duration Auto;
   - the prompt and the Exclude styles text, each in its own code block, ready to paste;
   - how many generations to run, and which song to give which title, e.g. the first song `S6 SCNP+Dark+Cello&DBass A`, the second `… B`;
   - to download each song in the format of its `file` and save it under exactly that file name directly in `assets/music/tracks/`;
   - what to send back: each song's page URL, e.g. its Suno song link, and, for a source whose song page the skill cannot read, the values its README section says come from the source, e.g. the tags, BPM, and length from the ElevenLabs Assets page.

   End the reply with ⌛ asking the designer to say when the files are in place. When the designer drops a take instead, e.g. a song they do not want to keep, delete its draft record, and re-letter the remaining drafts.

## Phase 2: Deploy

1. **Check the clone again**, as in step 1 of Phase 1, now allowing this skill's draft records and the files of the same names as untracked.

2. **Match the files to the drafts.** Each draft's music file must be directly in `assets/music/tracks/` under the draft's `file`. Block, naming each, when a draft has no file, or when an untracked file in `assets/music/tracks/` has no draft, unless it is a download of a draft's song under another name, e.g. `S6 SCNP+Dark+Cello&DBass A (1).mp3`: then rename it to the draft's `file` with a plain move, e.g. `mv`. Block also on an untracked file in a subdirectory of `assets/music/tracks/` or an untracked audio file directly in `assets/music/`, since it was dropped in the wrong place; suggest moving it into `tracks/`.

3. **Check each file.** Block, naming every file that fails, when any:
   - has an extension that the Soundtrack section of Music does not list. Suggest exporting the track as MP3, which every music source used so far can produce;
   - is larger than 7 MB (7 × 1024 × 1024 bytes). Suggest MP3, e.g. a 34 MB WAV from Suno is about 4 MB as MP3;
   - is byte-for-byte identical to a Track already in `assets/music/tracks/` or to another new file, e.g. the same export dropped in twice;
   - has the same source and original title as a row of the README table, which also lists excluded tracks whose files are gone. Suggest renaming the song in its source.

   When any file blocks, change nothing, not even for the files that pass, so that the designer fixes the set and confirms again.

4. **Complete the records.** Fill each `TODO` from the source: read each song page the designer sent, e.g. with a web fetch of a Suno song link, and take the rest from what the designer sent; ask for any value still missing. Where the source stored a prompt other than the one pasted in, e.g. Suno's Variety rewrote the Styles text, the stored text becomes `prompt` and the pasted one `prompt_from.produced_prompt`. Correct a drafted setting the designer reports having changed, e.g. a different slider value, and say so in `notes`. Remove the `# DRAFT` line. No `TODO` may remain.

5. **Record the tracks in the README.**
   - Add one table row per file, with its file name, original title, and source, keeping the table in order of file name.
   - Add each new naming code to the scheme's lists, and update the section of each source the new files come from when it lists its files. A source the README has no section for gets one, worded like the existing ones, giving where the tracks were made and how their original titles relate to their downloads.
   - For an existing track that gains or changes its take letter, rename its file in `assets/music/tracks/` and its record in `assets/music/yaml/` with `git mv`, and update every mention of its name that the scheme's renaming rule lists.
   - Change nothing else in the README.
   - Format only the README, with `npx oxfmt --write assets/music/README.md`, and review its diff.

6. **Check.** Run `npm run check`. When it fails only in files the skill did not touch, e.g. another session's half-finished specification, record that for the report and continue. When it fails in the skill's files, fix it. The Git hooks check the whole working tree, so another session's work can still make the commit or push fail in step 7 or 8. Never bypass them with `--no-verify`; when a hook fails, stop and report, leaving the files and README in place and any commit unpushed.

7. **Commit only this work.** Stage exactly the skill's paths: `git add -- <each new file and track record, and each path of a renamed existing track> assets/music/README.md`. Commit with those paths as the pathspec, `git commit -m "<message>" -- <the same paths>`, so that nothing another session staged is committed. The message names the new tracks, e.g. "Add Suno v6 tracks S6 SCNP+Dark+Cello&DBass A and B", and ends with the attribution lines the session requires. Then run `git show --stat HEAD` and confirm that the commit holds only those paths.

8. **Push** with `git push origin main`. When it is rejected because `origin/main` moved, run `git fetch origin`, and:
   - when `git status --porcelain --untracked-files=no` prints nothing, run `git rebase origin/main`, rerun step 6, and push again;
   - otherwise another session's uncommitted changes stop a rebase; never stash or autostash them. Stop and report that the commit is made but not pushed, and why, and skip Phase 3.

   After a push, confirm with `git fetch origin` and `git merge-base --is-ancestor HEAD origin/main`.

## Phase 3: Refresh the Implementation

The designer's request to add music is the explicit request to update the Implementation's content that this phase needs; it never makes any other change to the Implementation.

1. Identify the Implementation repo, check that no other session is changing it, and fetch it, as steps 2 and 4 of the `update-implementation` skill direct. The target Specification revision is the commit pushed in Phase 2. Unlike that skill, uncommitted work of other sessions in the Spec repo does not stop this phase, since it reads only committed revisions.
2. List the difference from the Specification baseline to the target, as step 5 of `update-implementation` directs. When it is not content-only, e.g. another session pushed a specification change the Implementation has not taken yet, change nothing in the Implementation: report that the new tracks are pushed but not yet in the Implementation, and that the `update-implementation` skill brings them in together with that change.
3. Otherwise follow the Content-only update of `update-implementation`, then its step 8, which commits and pushes; the push redeploys the Implementation when its publishing setup deploys on push. When the Content-only update finds that the change is not content-only in effect, stop as in step 2 instead of continuing with its Workflow.

## Report

After Phase 1, the steps for the designer are the reply, followed by:

- 🔍 the decisions for the designer to review: each take's name, each new naming code, each existing track that would gain a take letter with its old and new name, and each choice made in step 2, e.g. the prompt the skill wrote or the source settings copied from an earlier track;
- ⌛ the request to confirm that the files are in place.

After Phases 2 and 3, tell the designer:

- each new track's file name, with its source and original title, and each file renamed from its download name;
- each existing track that gained a take letter, with its old and new name, and each new naming code;
- the Spec repo commit link, in the form `https://github.com/konrad-jamrozik/game-v5/commit/<full-sha>`, or why the work was not committed or pushed;
- the Implementation commit link and its old and new Specification baseline, or why the Implementation was not refreshed and the next step for it;
- every uncommitted or untracked path outside the skill's work that was observed and left untouched, grouped by directory, or that there was none;
- on a block, every reason, each with what the designer should do, e.g. export the track as MP3 and drop it in again.
