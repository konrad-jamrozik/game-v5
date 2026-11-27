# Session coordination

Several T3 Code threads can work in the same clones at once, e.g. one running the `apply` skill in the Implementation repo while another runs `add-new-music-track` in the Spec repo's main local clone. When a check finds work in its way that this session did not make, e.g. uncommitted or untracked files, commits on `main` that `origin/main` lacks, or a clone on another branch, that work usually belongs to another thread that is still running. Wait for that thread to finish and then continue, rather than stopping. Every request follows this, not only a skill, as [Other sessions' work](../../AGENTS.md#other-sessions-work) in `AGENTS.md` says. This file is not a skill; the skills link to it where a check can block.

This applies only in T3 Code, recognized by its tools, e.g. `t3_thread_list`. In any other host, stop as the check directs.

1. **Find the owner.** List the threads of every project with `t3_thread_list` and `allProjects: true`, and read with `t3_thread_read` each one that is not settled and was active recently, newest first. A thread owns the work when it names the clone, the branch, or the paths, e.g. it reports editing `src/combat/` of `game-v5-impl-web`, or when its task would produce them, e.g. an `add-new-music-track` run and untracked files in `assets/music/tracks/`. Its own worktree's files are never in the way of another clone, so only threads working in the blocked clone itself count.
2. **Wait for a running owner.** Tell the user in one line which thread, by its link, and what of its work is in the way, e.g. "waiting for <link>, which has uncommitted changes in `src/combat/` of `game-v5-impl-web`". Call `t3_thread_wait` with `untilDelegatedWorkSettled: true`, follow its `next` on a timeout, and call it again until the thread's run finishes. Then run the check that blocked again, from the start of its step, and continue the work when it passes.
3. **Queue behind the next owner.** When the check blocks again on work of another thread, e.g. one that was also waiting and started as soon as the first owner finished, wait for that one in the same way. Threads waiting for the same clone thus go one at a time, each as the clone frees.
4. **Stop and ask the user only when waiting cannot help**, naming the blocking paths, commits, or branch, and the thread when there is one:
   - no thread owns the work, e.g. the Game designer's own edits;
   - the owner finished and left the work in place, e.g. it awaits the designer's review of an uncommitted diff, or its push failed;
   - the owner is waiting for the user, e.g. its last reply ends with ⌛, so the user should answer that thread first;
   - the owner is itself waiting for this thread. Then the thread that started later stops, so that the two never wait for each other.
5. **Never touch the owner's work or run**: never stash, commit, discard, or take over its changes, and never send to, interrupt, or hurry the owner's thread.
