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

## What decides whether the Mission site can exist

Recorded on 2026-11-18.

- Whether a Lead's Mission site can be brought into existence at all may depend on arbitrarily complex conditions on the Campaign, combined with "and", "or", and "not", e.g. the Agency possesses some artifact and it was not stolen, or the Agency got some secret information from somewhere.
- While the Mission site can be brought into existence, the Lead leading to it must be repeatable until the resulting Mission is Won.
- The exception is a very special Mission that the player gets only one attempt at: its Lead is not repeatable after the first Mission site, whatever becomes of that Mission site.
- Quite complex logic is therefore expected around Lead repeatability, more than the fixed conditions of today's [Lead availability](../specs/design/mechanics/leads-and-progression.md#lead-availability).

## Working name for how long a Lead keeps creating Mission sites

Recorded on 2026-11-18. "Repeatable" is too ambiguous as the name of this setting, so its working name is `stops_after`, a property of the MissionSiteArchetype whose values each name the event after which the Lead creates no further Mission site of it:

| Value | Meaning |
| --- | --- |
| `first_mission_site` | The Lead creates one Mission site ever, whatever becomes of it. This is the very special Mission that the player gets only one attempt at. |
| `first_win` | The Lead creates a new Mission site after each one whose Mission is Lost or that Expired, until one Mission is Won. This is the default. |
| `never` | The Lead keeps creating Mission sites even after a Won Mission, so the Mission can be Won any number of times. |

The value `never` means only that this setting never stops the Lead. The conditions that decide whether the Mission site can exist still can, e.g. when the Lead's Faction is Eliminated.

## Decisions on conditions that can stop holding

Recorded on 2026-11-18.

- **Discovered stays discovered:** Once a Lead is discovered it stays discovered, even when the conditions that discovered it stop holding. The Retired world state should therefore keep a list of the discovered Leads, instead of "discovered" being calculated from conditions that hold for ever.
- **Temporarily unavailable versus permanently gone:** A discovered Lead may be unavailable for investigation. The player must be able to tell a Lead that is discovered but temporarily unavailable from a Lead that is discovered and can never be investigated again, e.g. because its single Mission was Won. Today's Lead statuses Inactive and Archived make this distinction.
- **The player sees no conditions:** The player never sees a Blocking condition or a fulfilled condition of a Lead. To the player a Lead is either available or not.
- **Instant interruption:** For now, when the conditions stop holding while an Investigation of the Lead is Active, the Investigation is cancelled at once and its Agents are sent back. A Mission site of the Lead that is Active is cancelled at once too. A Deployed Mission is never cancelled.

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
