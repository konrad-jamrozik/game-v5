# Implementation Performance

| Metadata | Value |
| --- | --- |
| Spec ID | PERF |
| Family | Guidance |
| Audience | Engine designer, Implementer |
| Owns | Why play slows down as a Campaign grows, the responsiveness the Implementation is suggested to keep, and how a Performance change is measured and recorded. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Play slows down as a Campaign grows because much of the Implementation's work is repeated for every Player action, each time over the whole Campaign, while the Campaign keeps growing. Every speed-up adds code that a smaller game would not need, so each Performance change is measured before and after, and recorded with its reasons whether it is applied or not, in the [Performance Log](performance-log.md), so that a later change can build on it or revert it.

# Glossary

| Term | Definition |
| --- | --- |
| Per-action cost | Work that the engine, an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access), or the GUI does once for every [Player action](../../design/foundation/engine-contract.md#player-actions-and-turns), as opposed to once for every [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns). |
| Performance change | One change to the Implementation, the specifications, or a tool, considered in order to make play or a tool faster, recorded as one row of the Performance Log. |
| Performance investigation | One inquiry into a slowness, from its first measurement to the decision on every Performance change it found, recorded as one section of the Performance Log. |
| Subsystem | The part of the Implementation or of a tool that a Performance change alters; one of the [values a Performance Log row records](#recording-a-performance-change). |
| Performance change status | Where a Performance change stands: Proposed, Applied, Postponed, Rejected, or Reverted. |
| Estimated gain | The time a Performance change is expected to save, given before it is applied, with the measurement it is derived from. |
| Observed gain | The time a Performance change saved, measured on the same benchmark before and after it is applied. |

# Where the time goes

A Turn's cost is roughly the number of Player actions in it times the Per-action cost. Both grow with the [Agency](../../design/mechanics/domain-model.md#agency-and-agents), so a late Turn costs about the square of the number of Agents. The rules of [Advance turn](../../design/foundation/engine-contract.md#player-actions-and-turns) themselves are a small part of it.

A Per-action cost is suggested to be proportional to what the Player action changed, never to the size of the [Campaign](../../design/foundation/core-concepts.md#campaign-and-session). The costs that break this, found so far, are:

- **Engine commit:** the invariant check, the [Action results](../../design/foundation/player-api.md#action-results), and the [Current Autosave](../../design/foundation/saves.md#autosave-kinds), which encodes and writes the whole [Campaign save](../../design/foundation/engine-contract.md#persisted-data).
- **Engine views:** a query that copies or rebuilds the whole [Live world state](../../design/foundation/campaign-state.md#glossary), [Retired world state](../../design/foundation/campaign-state.md#glossary), or [History](../../design/foundation/campaign-state.md#glossary).
- **GUI refresh:** recomputing every query the GUI might show and rendering the whole Campaign screen again, possibly several times for one Player action.

# Responsiveness targets

The targets say when slowness is a defect rather than a cost of a large Campaign. They are suggested for a late Campaign, about Turn 250 with about 150 [Serving](../../design/mechanics/agents-spec.md#agent-statuses) Agents, on the Game designer's machine:

| Interaction | Suggested target |
| --- | --- |
| A Player action in the GUI, from the click to the updated screen | 100 ms |
| A control that closes or opens without a Player action, e.g. the [Equipment picker](../../design/ui/screens/agents-view.md#equipment-picker) | One frame, before any Player action it starts |
| One Turn played by the [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md) | 100 ms |

# Measuring a Performance change

A measurement compares versions rather than promising speeds, so the same benchmark runs before and after the change, on one machine, interleaved, e.g. old, new, old, new, old, new, and the median of each is kept. A machine that is busy with other work, e.g. Autopilot Lab runs, makes runs differ by several seconds, which interleaving exposes.

A Performance change that is meant to change no rule is suggested to be checked to end every benchmark Campaign in the same [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session), e.g. by comparing a hash of the final Campaign state.

The benchmarks used so far:

| Benchmark | What it runs | Measures |
| --- | --- | --- |
| Autopilot benchmark | The Basic Autopilot AI for 130 Turns from seed `1-1` with a Reserve share of 10%, about 1,000 Agents at the end | Wall-clock time of the whole run |
| GUI action benchmark | The Basic Autopilot AI to about Turn 225, then `equipAgent` repeated on one [Agent](../../design/mechanics/domain-model.md#agency-and-agents), each followed by every query the GUI's Campaign screen reads, under a CPU profile | Time of one commit, of each query, and the functions that take it |

A Node benchmark leaves out the browser: IndexedDB writes and React rendering are measured in the browser's performance profiler, and a Node figure is a lower bound of the browser's.

# Recording a Performance change

The Performance Log keeps every Performance change considered, also those never applied, so that a later investigation does not repeat a rejected idea without its reasons. Each Performance investigation records its date in Pacific time, the T3 thread's name and ID, its Artifacts, the benchmark it used, and one row for each Performance change with:

- **Subsystem:** Engine commit, Engine actions, Advance turn, Engine views, Campaign saves, Autopilot AI, GUI, or Tools.
- **Performance change status**, and for every status other than Proposed, the reason and the date of the decision.
- **Estimated gain** and **Observed gain**, each as a time or as a share of the benchmark; a gain that was not measured alone is recorded as measured together with the changes it was measured with.
- **Commits:** the [Spec repo](../mandatory/implementation-placement.md#glossary) and [Implementation repo](../mandatory/implementation-placement.md#glossary) commits that applied or reverted it, and the specifications it changed.

A row is never deleted. Reverting an Applied Performance change sets its status to Reverted and adds the revert commits.
