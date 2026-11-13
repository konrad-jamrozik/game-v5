# Game v5 account-transfer handoff

Informative continuity note, recorded on 2026-11-01 against commit `c40ab54`. This is not a specification or approval of
new rules. Linked specifications and their current metadata remain authoritative.

## Where the durable project knowledge lives

- [Game Design Brief](game-design-brief.md): gameplay intent, strategic trade-offs, interface progression, determinism,
  and the role of [game-ts](https://github.com/konrad-jamrozik/game-ts) as a reference rather than a required implementation.
- [Specification index](specs/README.md): document ownership, foundation dependency direction, and links to every spec.
- [Work plan and backlog](specs/governance/work-plan.md): accepted review sequence, checkpoints, and implementation
  authorization boundaries.
- [Specification conventions](specs/governance/spec-conventions.md) and
  [Artifact Relationships](specs/governance/artifact-relationships.md): authoring and relationship rules.
- [Cycle register](spec-relationship-cycles.md): retained dependency cycles and prospective removal work.
- [Derived catalog](derived/README.md): generated navigation, glossary, and relationship diagrams. Edit source specs,
  then run `npm run docs:generate`; do not maintain these views manually.
- [Repository instructions](../AGENTS.md), [README](../README.md), and
  [spec-correctness skill](../.agents/skills/spec-correctness/SKILL.md): environment and validation workflow.

## Current stopping point

The application is still a browser placeholder. Game contracts are being developed before gameplay implementation.
The accepted work plan keeps batch 1 In review and subsequent batches Queued. Batch 1 now comprises Core Concepts,
Engine Contract, Campaign State, Game Data Records, and Domain Model. Campaign State and Game Data Records are Accepted; Core Concepts,
Engine Contract, and Domain Model are Draft. Partial acceptance does not complete the batch.

The foundation split, engine API hierarchy, scoped Delegated AI, and Campaign configuration terminology are already
saved in the specifications. Earlier chats use obsolete names, e.g. Modeling Foundations and Content entry; use
the current glossaries and terminology table when continuing. Agent names an in-game individual; Delegated AI names
the AI executing a bounded gameplay task.

The latest committed clarification establishes that Campaign state contains World state and Campaign configuration,
with History inside World state. Campaign configuration can change only through specified commands and rules; it
is restored with the corresponding World state through undo, redo, and save/load. Historical configuration records
belong to History; current configuration values belong to Campaign configuration.

Review the pending discussion below before further foundation changes. Do not silently advance to the next batch
or treat a completed draft as authorization to implement game code. The work plan schedules an implementation-readiness
assessment after batch 4, rather than committing to an implementation date.

## Pending discussion: persistence hierarchy and global settings

Source: the final exchange in the chat titled "Clarify what that means in chat", on 2026-10-20 in America/Los_Angeles
(2026-10-21 UTC). The user requested design advice; the response explicitly ended with "No files changed yet."
No subsequent acceptance or implementation of that proposal was found in the reviewed context.

### User's unresolved request and stated assumption

The user questioned whether Session is needed at all and asked for a conceptual persistence hierarchy diagram.
They wanted the configuration cascade explained, a named container for settings available before any Campaign is
loaded, and a term for the current world data distinct from History. They stated that there should be one set of
global/game settings, with no per-player-account layer.

They also asked where the diagram should live. The following answer was a proposal, not an agreed contract.

### Proposed containers and runtime boundary

Keep Session as a runtime execution context for Current campaign selection, Dev mode, and active delegation. Ending
the application ends that Session. Introduce a separate persisted root, provisionally called Game storage, holding
Global configuration and saved campaign records. These proposed names are not yet canonical glossary terms.

```text
Game storage (persisted; proposed)
├── Global configuration (one set)
└── Saved campaign records (zero or more)
    └── Saved campaign record
        ├── Campaign state
        │   ├── Campaign configuration
        │   └── World state
        │       ├── Current world state (proposed term)
        │       └── History
        └── Controller continuation data
            └── History cursor and Delegated AI memory checkpoints

Session (runtime; proposed narrower meaning)
    Reads/updates Global configuration and loads/saves campaign records.
```

This is conceptual ownership, not a database schema, file format, or required class layout. A saved campaign record
contains more than gameplay Campaign state because it also retains controller continuation data. Engine Contract
already requires saved continuation and memory checkpoints; the proposal supplies an explicit container hierarchy.

Global configuration would mean persisted application-wide settings shared across Campaigns and available before
Campaign selection. Proposed examples were volume, language, and tutorial-popup preferences. At startup, stored
preferences would override Game build defaults. Loading a Campaign would not replace global preferences.

### Proposed configuration cascade

| Setting scope     | Proposed effective-value rule                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Global preference | Stored Global configuration overrides the Game build default.                                        |
| New Campaign      | Explicit creation choices override stored new-Campaign defaults, which override Game build defaults. |
| Existing Campaign | Its own saved Campaign configuration applies.                                                        |

New-Campaign defaults would be copied during creation, with no live inheritance into existing Campaigns. Changing
a global creation default would therefore not change an existing playthrough. Campaign-specific overrides for global
preferences were proposed to remain out of scope initially.

### Proposed terminology and document ownership

Introduce Current world state for the component of World state at the selected history position, excluding History.
"Current" would include an earlier position selected by undo, not necessarily the furthest point reached.
Keep Committed state for complete Campaign state at an accepted-command boundary; that term also includes Campaign
configuration and describes completeness/timing rather than a child container.

Proposed placement when the design is resolved:

- [Core Concepts](specs/foundation/core-concepts.md): shared definitions and the revised Session boundary.
- History and Persistence, since replaced by [Data ownership](specs/foundation/engine-contract.md#data-ownership) in Engine Contract, [Saves](specs/foundation/saves.md), and [Configuration](specs/foundation/configuration.md): persistence diagram, containers, startup
  loading, and configuration cascade; revisit the current Session-owned state section.
- [Engine Contract](specs/foundation/engine-contract.md): Session lifecycle and runtime responsibilities.

Whether to retain the name Session, whether to adopt these new container names, and the exact persistence/cascade
contract still need review. Current specifications have not been rewritten around this proposal.

## Transfer audit and limits

The audit inspected the tracked project documentation, Git status, available active and archived game-chat listings,
recent game-chat conclusions, and relevant design exchanges. Older chats were sampled rather than exhaustively
exported. The pending persistence/global-settings discussion above was the clear unsaved design proposal found.
This note preserves its substance so continuation does not depend on access to that chat.

Before this handoff was added, `main` was clean at `c40ab54` and matched the local `origin/main` tracking ref. No
untracked project files were reported. Ignored `node_modules/` and `dist/` are install/build outputs; dependencies
and build instructions are already reproducible from tracked files. No standalone files were found in the local
Codex plans directory, and no separate memory files were supplied in this chat's context.

This audit does not establish that every old chat, account memory, external document, or attachment has been
reviewed. It is a project handoff, not an account export. Existing repository instructions, specs, and this note
provide the starting context for a fresh assistant.

Use the Node/npm versions and setup in README. Verify both executables before npm scripts. Run specification lint
first, then derived-document checks when checking specs. Before completing repository changes, run `npm run check`.
Passing deterministic checks does not accept a draft or establish gameplay correctness.
