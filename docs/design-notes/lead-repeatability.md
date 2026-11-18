# Lead repeatability

These are the Game designer's working notes on which Leads can be investigated again, recorded on 2026-11-16 to inform a later specification change. They set no rule: the specifications in `docs/specs/` own every rule, and today they specify no Lead repeatability beyond what [Lead availability](../specs/design/mechanics/leads-and-progression.md#lead-availability) already allows.

## Terms in use and still open

- **Completed Lead** is specified: a Lead with at least one Completed Investigation, under the Glossary of [Leads and Progression](../specs/design/mechanics/leads-and-progression.md#glossary).
- **Repeatable Lead** is the working name for a Lead that can become a Completed Lead any number of times.
- A Lead that can be Completed at most once has no name yet. "Unique" is reserved for some truly unique, very rare Leads, not yet designed. "One-time" was considered, but could be misread as a Lead that appears only once.

## Which Leads are repeatable

- Leads whose completion creates a Mission site are repeatable. Leads whose completion creates none are not.
- E.g., "Locate Red Dawn HQ": completing it creates an HQ Mission site, which may expire. The HQ did not move, but the intel on it went stale, and sending Agents on stale intel would be a very bad idea. So the Lead has to be investigated again to refresh the intel on the HQ.
- Repeatable for how long has at least two kinds:
  - **Until the resulting Mission is Won**, when that Mission is not repeatable: the Lead is done once its Mission is Won.
  - **Until the Lead's Faction is Eliminated**, when the resulting Mission is repeatable: the Lead stays repeatable after a Won Mission.
- More advanced constraints may follow, e.g. the Mission stops being available for some other reason.

## Leads that can be Completed at most once

- Such a Lead can be investigated until it is Completed, and then never again.
- Until it is Completed, it may keep appearing and expiring, e.g. it is available for a while, the player does not investigate it, it expires, and it appears again later.

## Faction scope

- A Lead may be scoped to one Faction, so the same kind of Lead for two Factions is two Leads, e.g. "Infiltrate operations network of Red Dawn" and "Infiltrate operations network of Exalt", each of which can be Completed at most once.
- Faction-agnostic Leads will exist too.

## Draft workflow of one repeatable Lead

E.g., a Lead whose completion creates a Mission site, under today's rules and the required progress of [Investigations](../specs/design/mechanics/investigations.md):

```text
Lead undiscovered ──(Mission at a prerequisite Mission site Won)──► Lead discovered, Available
Available, no Active Investigation
   └─ startInvestigation ─► Investigation Active
         ├─ all members leave ─► Investigation Abandoned (progress → 0) ─► Lead still Available
         └─ progress ≥ Actual required progress ─► Investigation Completed
               ├─ Lead becomes a Completed Lead (completion count + 1)
               └─ Mission site created, Active ─► Lead Inactive
                     ├─ Expired (intel went stale) ───────► Lead Available: investigate again
                     ├─ Mission Deployed ─► Lost ─────────► Lead Available
                     ├─ Mission Deployed ─► Won ──────────► today: Lead Archived; Leads requiring it discovered
                     └─ Cancelled (Faction Eliminated) ───► Lead Archived
Any state ──(Faction Eliminated)──► Lead Archived
```

Under "repeatable until the Faction is Eliminated", a Won Mission would make the Lead Available again instead of Archived. A Lead that can be Completed at most once would follow the same path up to the Investigation becoming Completed, and then be done instead of creating a Mission site.
