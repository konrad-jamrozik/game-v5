---
name: add-music
description: Plan, add, and deploy new Soundtrack tracks. From the Game designer's description of the stem, adjustments, source, and model, draft each track's record with its name and the steps to generate it; once the designer has dropped the generated files into assets/music/tracks/, check them, complete the records and the music README, push from the main local clone, and refresh the Implementation's content.
---

# Add music

Use this skill when the Game designer wants new music in the Soundtrack, e.g. "let's try SCNP, darker, with cello and double bass, on Suno v6", or says the files of an earlier draft are in place, e.g. "I uploaded the cello tracks".

The Soundtrack is owned by the [Music](../../../docs/specs/design/ui/music.md#soundtrack) specification, the file names, sources, and track records by [the music README](../../../assets/music/README.md), and the codes by the Prompt codes section of [the music taxonomy](../../../assets/music/music-taxonomy.md#prompt-codes). All three win when this skill disagrees with them. Read the Soundtrack section of Music, the whole README, and the Prompt codes section before changing anything; they are the only specifications this skill reads.

The skill runs in three phases: [Draft](#phase-1-draft) the tracks and tell the designer how to generate them, wait while the designer generates and downloads them, then [Deploy](#phase-2-deploy) the files to the Spec repo and [Refresh the Implementation](#phase-3-refresh-the-implementation). When the skill starts, it finds where it stands from the working tree: draft records in `assets/music/yaml/drafts/` whose files are now in `assets/music/tracks/` resume at Phase 2; otherwise it starts at Phase 1.

This skill adds Tracks only. It never changes a specification: whenever adding the tracks would need any change beyond new Track files, their track records, new README entries, and new codes in the Prompt codes section, it blocks and tells the designer, so that the change goes through the `apply` skill instead.

## Where it works

The skill works directly in the main local clone of the Spec repo, e.g. `repos/game-v5/`, never in a worktree, because that is where the designer drops the files. Other sessions may have uncommitted work there. The skill leaves all of it untouched: it never stages, commits, stashes, resets, restores, or deletes a file it did not create or rename, and never runs a command that rewrites files outside `assets/music/`, e.g. `npm run fix` or `npm run format`.

Its own work is exactly these paths: each draft record it writes in `assets/music/yaml/drafts/`, as the designer may have renamed it, and the same record once moved into `assets/music/yaml/`, each record it adds there for another take of a draft's prompt, the music file of the same name as each of these records in `assets/music/tracks/`, `assets/music/README.md`, and `assets/music/music-taxonomy.md`.

Outside the repository, the skill also keeps the Game designer's personal music backup, `C:\Users\spawa\OneDrive\personal\projects\ufo_game\music\`, which holds a copy of every track's audio, kept and excluded. Its own `README.md` gives its layout, e.g. one folder per source, such as `suno/` for Suno v6; read it before copying into the backup. The skill only adds and renames files there, never deletes one.

## Phase 1: Draft

1. **Check the clone.** In the main local clone, run `git fetch origin`, `git branch --show-current`, and `git status --porcelain --untracked-files=all`. Block when:
   - the branch is not `main`;
   - `main` has commits that `origin/main` lacks, since pushing would publish another session's commits;
   - any tracked file under `assets/music/` is changed, staged, or deleted, e.g. the README is modified, or any file is untracked there, since that is another session's music work in progress, unless it is one of this skill's draft records, which the designer may edit, rename, or delete, e.g. one the designer is now replacing or one whose song is not downloaded yet.

   Then run `git merge --ff-only origin/main`. Uncommitted work elsewhere does not stop it unless it touches a file the incoming commits change; when the merge refuses, block and name the files Git lists.

2. **Settle the description.** The designer gives the stem, the adjustments, the source, and the model, e.g. "SCNP, Dark, instruments cello + double bass, Suno v6". Take from the README and the Prompt codes section what each means: a stem or adjustment named by its code reads as that code's `meta_prompt_taxonomy` entry, and the source's README section tells how it is used. Ask, in one question, only for what the description and the README leave open, e.g. a source the README has no section for. Where the designer has not said, choose and report as a decision to review:
   - the number of takes: one generation, i.e. as many songs as the source makes per generation, e.g. two for Suno and for ElevenLabs Music;
   - the source's settings, e.g. Suno's Instrumental switch, sliders, and Exclude styles: those of the latest track of the same line, i.e. the same stem and the most adjustments in common, adjusted only where the new adjustments need it, e.g. an Exclude styles entry that would forbid a requested instrument;
   - the prompt: the skill writes it from the stem and adjustments, in the style and length of that latest track's prompt and within the source's limits the README records, e.g. v03ai's 1,000 characters. When the designer supplies a prompt, e.g. one ChatGPT wrote, use it word for word instead.

3. **Name the tracks.** The designer chooses the names. When they give a name, e.g. `Unknown Contact A` and `B`, or ask a track to keep its original title, e.g. `Restricted Orbit`, that is a custom name, as the README's Custom names section describes: check it only against the Windows file name rules, and it neither takes nor changes any take letter of the scheme. Only when the designer gives no name, or asks for one under the README's optional Naming scheme, build it from the records, e.g. `S6 SCNP+Dark+Cello&DBass A` and `B`, of which only the first take gets a draft record. Check each such name against the scheme's length limit and Windows file name limits. Each new take's letter is the next letter its `prompt_code` has not yet given as a `variant`, e.g. `D` for a new take of a prompt whose records hold `A`, `B`, and `C`, as the scheme's Take rule says; existing tracks keep their names. Whatever the name, a source, model, stem, or adjustment with no code yet gets a new code and segment in the Prompt codes section, since the record's code and `prompt_code` are built from them; propose each to the designer.

4. **Write the draft records.** For each distinct prompt, write one draft record, never one per take: the `.yaml` file with the name of the prompt's first take, e.g. `S6 SCNP+Dark+Cello&DBass A`, in `assets/music/yaml/drafts/`, as the README's Track records section describes. The records of the other takes, e.g. the second song of the same generation, are written in Phase 2 from the songs the designer actually kept. The draft holds every value already known:
   - `file`: the take's name with the extension the source downloads, e.g. `.mp3` for Suno, which must be one the Soundtrack section of Music lists. Read the list from the specification, never from memory;
   - `prompt_code`, built from `meta_prompt_taxonomy`, and `variant`, the take's letter or `One only`, as the README's Track records section describes, with `serial_id` written as `TODO`;
   - `source`, `model` as far as known, `instrumental`, `meta_prompt_taxonomy`, and the source's key with the prompt and every setting to submit, e.g. `suno` with `prompt`, `exclude_styles`, `weirdness`, `style_influence`, `variety`, `max_mode`, `personalize`, and `duration`;
   - `original_title`: the take's name itself, e.g. `S6 SCNP+Dark+Cello&DBass A`, which the designer gives the song in the source, so that it finds one song there and the download is named after the take.

   Every value only the source can give, e.g. `song_url`, `created`, `tags`, `length`, and the full `model` label, is written as `TODO`, and the record starts with the comment line `# DRAFT: TODO values are filled in from the source after generation.` Commit and push the drafts as steps 8 to 10 of Phase 2 do, with the draft records as the paths and a message that names them, e.g. "Draft Suno v6 track S6 SCNP+Dark+Cello&DBass A", so that a draft is kept even when its song is never downloaded.

5. **Tell the designer what to do**, as one numbered list per source, then stop and wait for them to confirm that the files are in place. Send it with `send_to_user` when the tool is available, so that it reaches them whole:
   - where to generate, e.g. suno.com with Suno v6 selected;
   - every setting to enter, as the source's UI labels it, e.g. Instrumental on, Weirdness 40%, Style influence 70%, Variety Off, Max Mode Off, Personalize Off, Duration Auto;
   - the prompt and the Exclude styles text, each in its own code block, ready to paste;
   - how many generations to run, and which song to give which title, e.g. the first song `S6 SCNP+Dark+Cello&DBass A`, the second `… B`;
   - to download each song in the format of its `file` and save it under exactly that file name directly in `assets/music/tracks/`;
   - what to send back: each song's page URL, e.g. its Suno song link; and, for a source whose song data the skill cannot read, each song's final prompt as the source shows it after generation, copied word for word, and the values its README section says come from the source, e.g. the tags and length from the ElevenLabs Assets page. For Suno, the skill reads the final Styles text and the rest itself, from each song link or, without one, from the song ID in the downloaded MP3, as the README's Reading Suno song data section describes.

   End the reply with ⌛ asking the designer to say when the files are in place.

## Phase 2: Deploy

1. **Check the clone again**, as in step 1 of Phase 1, now allowing the designer's edits, renames, and deletions of this skill's draft records, and, untracked, the music files that step 3 matches to them.

2. **Take the drafts as the designer left them.** The designer may have edited a draft before generating, e.g. renamed it, changed its name's codes, a slider, or the Exclude styles, and then generated from the edited draft. The draft records now in `assets/music/yaml/drafts/` are the truth: keep every edit, never restore the drafted value, and record in `notes` what the designer changed from the skill's draft. When an edit leaves the record at odds with itself, e.g. a name that drops or adds a code that `meta_prompt_taxonomy.adjustments` still lacks or holds, follow the designer's name: bring the adjustments in line with it, give each new code an entry in the Prompt codes section, and report each such change as a decision to review. A draft the designer deleted is a take not kept.

3. **Match the files to the drafts.** Each draft's music file must be directly in `assets/music/tracks/` under the draft's `file`. Each other take of a draft's prompt, e.g. the `B` song of the generation whose `A` is the draft, has its file there with the same name but its own take letter, and gets its own record in step 5, copied from the draft. A draft with no file yet, e.g. one whose song the designer has not downloaded, stays a draft for a later run; the rest of this phase skips them, and the report names each. Block, naming each, when an untracked file in `assets/music/tracks/` matches no draft in either way, unless it is a download of a draft's song under another name, e.g. `S6 SCNP+Dark+Cello&DBass A (1).mp3`: then rename it to the draft's `file` with a plain move, e.g. `mv`, or a file the designer asks to add without a draft, under a custom name or its original title, e.g. `Unknown Contact A.mp3` or `Restricted Orbit.mp3`: then write its record in step 5 from scratch, as step 4 of Phase 1 would have drafted it, from what the designer sent, e.g. their prompt, settings, and draft values, and never rename the file. Block also on an untracked file in a subdirectory of `assets/music/tracks/` or an untracked audio file directly in `assets/music/`, since it was dropped in the wrong place; suggest moving it into `tracks/`.

4. **Check each file.** Block, naming every file that fails, when any:
   - has an extension that the Soundtrack section of Music does not list. Suggest exporting the track as MP3, which every music source used so far can produce;
   - is larger than 7 MB (7 × 1024 × 1024 bytes). Suggest MP3, e.g. a 34 MB WAV from Suno is about 4 MB as MP3;
   - is byte-for-byte identical to a Track already in `assets/music/tracks/` or to another new file, e.g. the same export dropped in twice;
   - has the same source and original title as a row of the README table, which also lists excluded tracks whose files are gone. Suggest renaming the song in its source.

   When any file blocks, change nothing, not even for the files that pass, so that the designer fixes the set and confirms again.

5. **Complete the records.** First write the record of each other take that step 3 matched, copied from its draft under its own name. Then fill each `TODO` from the source, and never assume the source kept the pasted prompt unchanged. For a Suno song, read its data from the clip API, `https://studio-api.prod.suno.com/api/clip/<id>`, which needs no sign-in, as the README's [Reading Suno song data](../../../assets/music/README.md#reading-suno-song-data) section describes, never from a web fetch of the song page, which shows none of it; that data holds the final Styles text and every other value. Take each song's `<id>` from its song link, or, when the designer sent none, from the ID3 tags of its downloaded MP3, as that section describes; never ask the designer for a link the file already holds. For another source, take the values from what the designer sent, asking for each song's final prompt as the source shows it unless they already sent it. Ask for any value still missing. When the way to read a source's data had to be worked out, e.g. a new API field or a source not read before, write it down in that source's README section in the same change, so that the next run reads it from there. Where a take's final prompt differs from the one pasted in, e.g. Suno's Variety rewrote the Styles text, differently for each take, the final text becomes that take's `final_prompt_from_gen_tool`, and the source's `prompt` keeps the pasted one. Where the source's data differs from a drafted setting, e.g. a different slider value, follow the source and say so in `notes`. Give each new record its `serial_id`: the next number after the highest any record holds, the new records in the order of `created` and of their takes. Check that each `prompt_code` and `variant` still follow the README's Track records section, e.g. a take the designer did not keep frees no letter. Remove the `# DRAFT` line. No `TODO` may remain. Move each completed draft from `assets/music/yaml/drafts/` into `assets/music/yaml/` with `git mv`, and write the record of each other take there too.

6. **Record the tracks in the README.**
   - Add one table row per file, with its file name, serial ID, code, variant, original title, and source, keeping the table in order of file name.
   - Add each new code, with its `meta_prompt_taxonomy` entry word for word and its segment, to the Prompt codes section of `assets/music/music-taxonomy.md`, and update the section of each source the new files come from when it lists its files. A source the README has no section for gets one, worded like the existing ones, giving where the tracks were made and how their original titles relate to their downloads.
   - Change nothing else in the README or the music taxonomy.
   - Format only these two files, with `npx oxfmt --write assets/music/README.md assets/music/music-taxonomy.md`, and review their diffs.

7. **Back up the audio.** Copy each new file into the music backup, into the folder its README gives for the file's source, e.g. `suno/` for Suno v6, and confirm that each copy is byte-for-byte identical to the file in `assets/music/tracks/`, e.g. by comparing SHA-256 hashes. A source with no folder yet gets one, added to the backup README's Layout. When the backup folder cannot be reached, e.g. OneDrive is not present on this machine, stop and report before committing anything.

8. **Check.** Run `npm run check`. When it fails only in files the skill did not touch, e.g. another session's half-finished specification, record that for the report and continue. When it fails in the skill's files, fix it. The Git hooks check the whole working tree, so another session's work can still make the commit or push fail in step 9 or 10. Never bypass them with `--no-verify`; when a hook fails, stop and report, leaving the files and README in place and any commit unpushed.

9. **Commit only this work.** Stage exactly the skill's paths: `git add -A -- <each new file and track record, and each completed draft record under its old and new name> assets/music/README.md assets/music/music-taxonomy.md`, so that a draft record the designer renamed or that became a take's record is committed as a rename. Commit with those paths as the pathspec, `git commit -m "<message>" -- <the same paths>`, so that nothing another session staged is committed. The message names the new tracks, e.g. "Add Suno v6 tracks S6 SCNP+Dark+Cello&DBass A and B", and ends with the attribution lines the session requires. Then run `git show --stat HEAD` and confirm that the commit holds only those paths.

10. **Push** with `git push origin main`. When it is rejected because `origin/main` moved, run `git fetch origin`, and:

- when `git status --porcelain --untracked-files=no` prints nothing, run `git rebase origin/main`, rerun step 8, and push again;
- otherwise another session's uncommitted changes stop a rebase; never stash or autostash them. Stop and report that the commit is made but not pushed, and why, and skip Phase 3.

After a push, confirm with `git fetch origin` and `git merge-base --is-ancestor HEAD origin/main`.

## Phase 3: Refresh the Implementation

The designer's request to add music is the explicit request to update the Implementation's content that this phase needs; it never makes any other change to the Implementation.

1. The Implementation repo is `game-v5-impl-web`, the sibling of the Spec repo's main local clone. Run `git fetch` there. It must be on `main` with no uncommitted or untracked files; otherwise another session is working in it, so report that the new tracks are pushed but not yet in the Implementation, and stop. Then fast-forward its `main` to `origin/main`. Uncommitted work of other sessions in the Spec repo does not stop this phase, since it reads only committed files.
2. Read the Spec repo commit the Implementation follows, from the `Spec:` trailer of its newest commit that has one. When `git diff --name-only <that commit>..<the commit pushed in Phase 2> -- docs/specs` in the Spec repo lists any file, another specification change is waiting for the Implementation: change nothing there, and report that the new tracks are pushed but not yet in the Implementation, and that the `apply` skill brings them in together with that change.
3. Otherwise run `npm run sync:spec` in the Implementation repo, then `npm run fix` and `npm run check`. Update a test that pins the Track list to the new list. When any other check fails, undo the sync with `git checkout -- . && git clean -fd` there and stop as in step 2. Then commit with the trailer `Spec: <full hash of the commit pushed in Phase 2>`, run `git fetch`, rebase onto `origin/main`, and push; the push deploys the game. Never force-push.

## Report

After Phase 1, the steps for the designer are the reply, followed by:

- 🔍 the decisions for the designer to review: each take's name, its `prompt_code` and `variant`, each new code with its segment, and each choice made in step 2, e.g. the prompt the skill wrote or the source settings copied from an earlier track;
- ⌛ the request to confirm that the files are in place.

After Phases 2 and 3, tell the designer:

- each new track's file name, with its source and original title, and each file renamed from its download name;
- each new track's `serial_id`, `prompt_code`, and `variant`, and each new code with its segment;
- each file copied into the music backup, with its folder there;
- the Spec repo commit link, in the form `https://github.com/konrad-jamrozik/game-v5/commit/<full-sha>`, or why the work was not committed or pushed;
- the Implementation commit link and the Spec repo commit it now follows, or why the Implementation was not refreshed and the next step for it;
- every uncommitted or untracked path outside the skill's work that was observed and left untouched, grouped by directory, or that there was none;
- on a block, every reason, each with what the designer should do, e.g. export the track as MP3 and drop it in again.
