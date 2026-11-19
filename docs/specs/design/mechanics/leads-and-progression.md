# Leads and Progression

| Metadata | Value |
| --- | --- |
| Spec ID | LEAD |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | What a Lead GDR describes, Lead prerequisites, Lead discovery, Lead availability, Lead status, and the effect of completing a Lead. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Leads are how the [Agency](domain-model.md#agency-and-agents) closes in on a [Faction](domain-model.md#factions). A [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) is a [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) that describes one line of inquiry into one Faction: each completed [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) of it creates one [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) targeting that Faction. Its Required progress says how much work it takes at least, and it may require other Leads first, so Leads form chains that reach deeper into a Faction.

What moves the Agency along a chain is winning, not investigating. A Lead's prerequisites name MissionSiteArchetypes, and each holds once a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) against the Lead's Faction is Won at a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) of its MissionSiteArchetype; and a Lead is available only while every prerequisite holds and no Mission at a Mission site it created is Won. Won Missions are kept in the [Campaign](../foundation/core-concepts.md#campaign-and-session), so nothing else needs to be recorded. A Lost Mission or an Expired Mission site therefore sends the player back to investigate the same Lead again, while a win discovers the Leads that require it, hidden from the player until then. A Lead is also not available while a Mission site it created is in progress, or once its Faction is [Eliminated](factions.md#glossary), and its Lead status says which applies.

# Glossary

These terms are specific to [Leads](domain-model.md#leads-investigations-mission-sites-and-missions). [Lead availability](domain-model.md#leads-investigations-mission-sites-and-missions) and other general terms are in the [Domain Model glossary](domain-model.md#glossary).

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Required progress | The [progress points](domain-model.md#leads-investigations-mission-sites-and-missions) an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) of a Lead needs at least to complete, set by the Lead's `required_progress`. | Lead difficulty; resistance |
| Blocking condition | A condition of Lead availability that does not hold for a Lead and so makes the Lead not available. |  |
| Discovered Lead | A Lead whose prerequisites hold, under [Lead discovery](#lead-discovery). Only a discovered Lead is Player-visible. |  |
| Completed Lead | A Lead with at least one Completed Investigation, i.e. whose completion count is at least 1, under [Missions from a Lead](#missions-from-a-lead). | Investigated Lead; successfully investigated Lead. An Abandoned or Active Investigation has also investigated its Lead. |
| Lead status | The Player-visible summary of a discovered Lead's availability: Available, Inactive, or Archived, under [Lead status](#lead-status). |  |

# Lead GDRs

The [GDRs](../foundation/core-concepts.md#game-build-and-content) a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names.

## Lead

A Lead describes one line of inquiry. A Lead is a GDR serving the Referenced GDR and Key for campaign facts purposes under [Game concepts](domain-model.md#game-concepts) in Domain Model; it is not a [Campaign instance](../foundation/core-concepts.md#campaign-instances), and a Lead's GDR never changes during a [Campaign](../foundation/core-concepts.md#campaign-and-session). A Lead has no lifecycle states. The table below is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Shape | Meaning | Read by |
| --- | --- | --- | --- |
| `name` | Non-empty text. | The display name of the Lead. | [Player-visible information](#player-visible-information) |
| `description` | Non-empty text. | The display description of the Lead. | [Player-visible information](#player-visible-information) |
| `faction` | The identifier of a FactionArchetype. | The [Faction](domain-model.md#factions) the Lead concerns: the Faction whose [Archetype](../foundation/core-concepts.md#campaign-instances) is this FactionArchetype. It decides the target Faction of the [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) the Lead creates, and blocks the Lead once that Faction is [Eliminated](factions.md#glossary). | [Lead availability](#lead-availability); [Completion effect](#completion-effect) |
| `required_progress` | A whole number of at least 1. | The Required progress of the Lead, in progress points. | [Investigations](investigations.md) |
| `requires` | A list, possibly empty, of prerequisites. Each prerequisite is a map with exactly one key, the prerequisite kind, and a value for that key. | The prerequisites that must all hold before the Lead is available, under [Prerequisites](#prerequisites). | [Prerequisites](#prerequisites) |
| `on_completion` | A map with exactly one key, the effect kind, and a value for that key. | What happens when an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) of the Lead completes, under [Completion effect](#completion-effect). | [Completion effect](#completion-effect) |

Exactly one prerequisite kind and exactly one effect kind exist, and these two tables are exhaustive:

| Prerequisite kind | Value | Meaning |
| --- | --- | --- |
| `mission_won` | The identifier of a MissionSiteArchetype. | Holds under [Prerequisites](#prerequisites) once a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) at a Mission site of that MissionSiteArchetype, targeting the Lead's Faction, is Won. |

| Effect kind | Value | Meaning |
| --- | --- | --- |
| `create_mission_site` | The identifier of a MissionSiteArchetype. | Creates one [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) under [Completion effect](#completion-effect). |

A Lead names the MissionSiteArchetypes of its prerequisites, its Faction, and the MissionSiteArchetype it creates by GDR identifier, never by inference from identifier text, under [References](../foundation/campaign-instances.md#references) in Campaign Instances.

## Lead GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the Lead [Type](../foundation/core-concepts.md#data-modeling), and it adds to [MissionSiteArchetype validation](missions.md#missionsitearchetype-validation) in Missions and [Faction GDR validation](factions.md#faction-gdr-validation) in Factions. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **Known properties:** Each Lead has `name`, `description`, `faction`, `required_progress`, `requires`, and `on_completion`, and no property other than those listed in its table above, apart from `id` and `type`. Its `name` and `description` are non-empty text.
2. **Faction resolves:** `faction` is the identifier of a FactionArchetype the Game build supplies.
3. **Required progress is valid:** `required_progress` is a whole number of at least 1.
4. **Prerequisite kinds are known:** `requires` is a list, and each of its entries is a map with exactly one key, which is `mission_won`. An entry with any other key, or with more than one key, is invalid.
5. **Prerequisite references resolve:** The value of each `mission_won` entry is the identifier of a MissionSiteArchetype the Game build supplies, and no two entries of one `requires` name the same MissionSiteArchetype.
6. **Prerequisites form no cycle:** Consider the relation in which each Lead points to every Lead whose `create_mission_site` names a MissionSiteArchetype that its `requires` names. Following it from any Lead never visits a Lead twice. A cycle, including a Lead whose `requires` names the MissionSiteArchetype it creates itself, is invalid.
7. **Completion effect is valid:** `on_completion` is a map with exactly one key, which is `create_mission_site`. A map with no key, with more than one key, or with any other key is invalid. The value of `create_mission_site` is the identifier of a MissionSiteArchetype the Game build supplies whose `kind` is `initiative`; naming a MissionSiteArchetype of kind response is invalid.

These rules guarantee that the prerequisite relation is a finite acyclic graph, that every Lead has exactly one Faction and exactly one MissionSiteArchetype to create, and that the [Completion effect](#completion-effect) supplies a MissionSiteArchetype of kind initiative, as [Mission site creation](missions.md#mission-site-creation) requires of its creating rule. A Lead that no other Lead requires, and a Lead whose prerequisite chain starts at a Lead with an empty `requires`, are valid; a Lead whose prerequisites can never hold in practice is also valid, because the rules do not examine Mission outcomes. A prerequisite may name a MissionSiteArchetype that no Lead creates, e.g. one of kind response.

# Missions from a Lead

**Proposed rule:** A Mission site is created by a Lead L exactly when it is an Initiative Mission site whose origin Investigation, under [Mission site properties](missions.md#mission-site-properties) in Missions, is an Investigation of L, i.e. retains a reference to L under [How concepts relate](domain-model.md#how-concepts-relate) in Domain Model. A [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) is created by no Lead. A Mission is from Lead L exactly when its Mission site was created by L.

Leads add nothing to [Campaign state](../foundation/core-concepts.md#campaign-and-session). [Prerequisites](#prerequisites) and [Lead availability](#lead-availability) read the Missions and their Mission sites, which are [retained](../foundation/world-history.md#glossary) for the whole Campaign with their final lifecycle states, under [Mission properties](missions.md#mission-properties) in Missions. A Won Mission stays Won for the rest of the Campaign, even if the Faction of the Lead later becomes [Eliminated](domain-model.md#factions), so whatever these rules derive from it holds for the rest of the Campaign too, under [Authoritative and Derived values](../foundation/core-concepts.md#authoritative-and-derived-values) in Core Concepts.

No rule counts completions either. A Lead's completion count, i.e. the number of Completed Investigations of the Lead, is a [Derived value](../foundation/core-concepts.md#value-classification) calculated from Investigation Campaign instances, and no rule of a Mechanics specification reads it. A Lead whose completion count is at least 1 is a Completed Lead. Whether a Lead is a Completed Lead is a Derived value too, and once true it stays true for the rest of the Campaign, because Completed Investigations are retained.

A Mission becomes Won in the [Turn advancement step](turn-advancement.md#glossary) Mission resolution, under [Mission resolution](missions.md#mission-resolution) in Missions, so every later step of that Advance turn sees the prerequisites and the Lead availability that the win changes.

# Prerequisites

**Proposed rule:** A prerequisite `mission_won` with the value X, in the `requires` of a Lead L, holds exactly when at least one Mission is Won whose Mission site is from the MissionSiteArchetype X and has as its target Faction the Faction whose Archetype is the FactionArchetype named by the `faction` of L. Otherwise it does not hold. The identifier X refers to the MissionSiteArchetype GDR itself, never to text parsed from an identifier.

- **Direct only:** A prerequisite concerns exactly the MissionSiteArchetype it names. It does not hold because a Mission site of another MissionSiteArchetype has a Won Mission, and it does not read the Investigations or which Lead, if any, created the Mission site.
- **Same Faction:** A Won Mission at a Mission site of X whose target Faction is not the Faction of L does not make it hold.
- **Permanent:** Because a Won Mission stays Won and is never removed, a prerequisite that holds holds for the rest of the Campaign. It does not stop holding when its Faction becomes Eliminated.
- **All must hold:** The prerequisites of a Lead are all of the entries of its `requires`. They hold together exactly when each of them holds. An empty `requires` holds together, because no prerequisite fails.

# Lead availability

**Proposed rule:** Whether a Lead is available is a Derived value, calculated from the [World state](../foundation/engine-contract.md#player-actions-and-turns) in which it is read; it is never stored, and it is not a state. A Lead L is available exactly when all of the following four conditions hold. The list is exhaustive.

| Condition | It holds exactly when |
| --- | --- |
| 1. Prerequisites hold | Every prerequisite in the `requires` of L holds, under [Prerequisites](#prerequisites). |
| 2. No Mission Won | No Mission from L is Won, i.e. no Mission at a Mission site created by L is Won. |
| 3. No [Unfinished Mission site](missions.md#glossary) | No Mission site created by L is an [Unfinished Mission site](missions.md#glossary). |
| 4. Faction not Eliminated | The Faction whose Archetype is the FactionArchetype named by the `faction` of L exists, and its Eliminated is no. |

The Lead is available exactly when conditions 1 to 4 all hold. When it is not available, its **Blocking conditions** are all of the conditions that do not hold; there may be several. No condition reads an Investigation: whether a Lead that already has an Active Investigation can be investigated again is not part of Lead availability; it is decided under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead). The availability of a Lead is read, e.g., by the [Player action](../foundation/engine-contract.md#player-actions-and-turns) that starts an Investigation of the Lead, under [Starting an Investigation](investigations.md#starting-an-investigation). Availability has no timing of its own: it is true or false in every World state, and it can change only when a World state changes one of the values the four conditions read.

By [Initial Factions](factions.md#initial-factions), the initial Campaign state contains exactly one Faction for each FactionArchetype, and no Faction is created or removed afterwards. Condition 4 therefore names exactly one Faction for every Lead that passes [Lead GDR validation](#lead-gdr-validation).

## What changes availability

A Lead's availability changes over a Campaign as the Mission sites it created resolve, as Missions are Won at the Mission sites its prerequisites name, and as its Faction is Eliminated.

The following table states, for each situation, what happens to the conditions and whether the Lead is available afterwards. It assumes that the conditions the row does not mention keep the values they had. The table is exhaustive for what changes a condition.

| Situation | Conditions that change | Result for L |
| --- | --- | --- |
| The [Completion effect](#completion-effect) of L creates a Mission site | 3 stops holding. | Not available while that Mission site is Active or its Mission is [Deployed](agents-spec.md#assignments); Lead status Inactive. |
| The Mission at that Mission site becomes Lost | 3 holds again. | Available again, if the other conditions hold; Lead status Available. A new Investigation creates a new Mission site. |
| That Mission site becomes Expired | 3 holds again. | Available again, as for Lost. |
| The Mission at that Mission site becomes Won | 3 holds again; 2 stops holding. | Never available again, for the rest of the Campaign, because a Won Mission stays Won under [Missions from a Lead](#missions-from-a-lead); Lead status Archived. |
| That Mission site becomes Cancelled, because the Faction of L is Eliminated | 3 holds again; 4 has stopped holding. | Not available, because 4 does not hold; Lead status Archived. Cancellation does not make L available. |
| The first Mission becomes Won at a Mission site of a MissionSiteArchetype that a prerequisite of L names, targeting the Faction of L | 1 can start holding, once every prerequisite of L holds. | L is discovered once every prerequisite of L holds, under [Lead discovery](#lead-discovery), and is available if conditions 2 to 4 hold; both happen in the same World state in which that Mission is Won. |
| The Faction of L becomes Eliminated | 4 stops holding, for good. | Not available for the rest of the Campaign, whatever the other conditions are; Lead status Archived if L is discovered. |

A situation not listed changes none of the conditions. In particular, the outcome of a Mission site, or of its Mission, that was created by a Lead other than L, or of a Response Mission site or [Response Mission](domain-model.md#leads-investigations-mission-sites-and-missions), changes a condition of L only when it is a Won Mission that makes a prerequisite of L hold; and any change to an Investigation of L that creates no Mission site changes no condition of L.

**Consequences.** Together the rules make the following hold:

- A Lost Mission or an Expired Mission site never blocks its Lead for ever: the Lead is available again and the [Agency](domain-model.md#agency-and-agents) obtains a new Mission site from it by a new Investigation. A Mission site cannot be attempted twice, under [Mission site lifecycle](missions.md#mission-site-lifecycle).
- A Lead whose prerequisites hold and whose Faction is not Eliminated stays available until a Mission from it is Won, apart from the [Turns](../foundation/engine-contract.md#player-actions-and-turns) in which a Mission site it created is Active or a Mission from it is Deployed.

**Informative rationale:** At most one Mission from a Lead is ever Won. A second would need a second Mission site of the Lead, but no Mission site of the Lead is created while condition 3 does not hold if an Investigation is started only for an available Lead and only one Active Investigation per Lead is allowed, under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead) in Investigations; and once a Mission from the Lead is Won, condition 2 never holds again.

# Lead discovery

**Inherited behavior:** A Lead L is discovered exactly when condition 1 of [Lead availability](#lead-availability) holds for it, i.e. every prerequisite in its `requires` holds, under [Prerequisites](#prerequisites). Otherwise it is undiscovered. game-ts revision `f1835a29` discovers a Lead the same way, in `getDiscoveredLeads` of `web/src/lib/model_utils/leadUtils.ts`; its dependency on a completed Lead and its negated dependency are not carried over, and remain TODOs.

Whether a Lead is discovered is a Derived value, calculated from the World state in which it is read; it is never stored. Its consequences are complete:

- **Permanent:** A prerequisite that holds holds for the rest of the Campaign, so a discovered Lead stays discovered for the rest of the Campaign, including after its Faction becomes Eliminated and after a Mission from it is Won.
- **From campaign creation:** A Lead with an empty `requires` is discovered in every World state.
- **Only by a win:** Only a Won Mission makes a prerequisite hold, so a Lead becomes discovered only in the [Turn advancement step](domain-model.md#turn-advancement-steps) Mission resolution, in the World state in which that Mission is Won.
- **Hidden until then:** An undiscovered Lead is not Player-visible, under [Player-visible information](#player-visible-information). An undiscovered Lead is never available, because condition 1 does not hold for it.

# Lead status

**Inherited behavior:** Every discovered Lead has exactly one Lead status, a Derived value decided by its Blocking conditions in the order of the following table, which is exhaustive. game-ts revision `f1835a29` names the same three statuses Active, Inactive, and Archived, in `getLeadStatus` of `web/src/lib/model_utils/leadUtils.ts`; Active is called Available here, because it holds exactly when the Lead is available.

| Lead status | It holds exactly when | Later change |
| --- | --- | --- |
| Archived | Condition 2 or condition 4 does not hold. | None: conditions 2 and 4, once not holding, never hold again. |
| Inactive | Conditions 2 and 4 hold, and condition 3 does not hold. | Available when the Mission site becomes Expired, or Concluded with its Mission Lost; Archived when its Mission is Won or its Faction is Eliminated. |
| Available | Conditions 1 to 4 all hold, i.e. the Lead is available. | Inactive when the [Completion effect](#completion-effect) of the Lead creates a Mission site; Archived when its Faction is Eliminated. |

A discovered Lead satisfies condition 1, so the table covers every discovered Lead. An undiscovered Lead has no Lead status. Lead status reads no Investigation: whether an Investigation of an Available Lead can be started now is decided under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead) in Investigations.

# Completion effect

**Proposed rule:** When an Investigation of a Lead L completes, the effect named by the `on_completion` of L applies. The completion itself, i.e. in which Advance turn an Investigation becomes Completed, is decided under [Completion](investigations.md#completion); it happens in the [Turn advancement step](domain-model.md#turn-advancement-steps) [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions). The effect kind `create_mission_site` has the following complete effect, applied once for that completion, in the same step:

1. It is the creating rule of an Initiative Mission site under [Mission site creation](missions.md#mission-site-creation) in Missions, and supplies to it exactly these three inputs:
   - the MissionSiteArchetype: the one whose identifier is the value of `create_mission_site`, which is of kind initiative under [Lead GDR validation](#lead-gdr-validation);
   - the origin Investigation: the Investigation of L that completed;
   - the target Faction: the Faction whose Archetype is the FactionArchetype named by the `faction` of L, which exists and is exactly one under [Initial Factions](factions.md#initial-factions) in Factions.
2. Missions then creates exactly one Initiative Mission site from these inputs, with the initial values, Enemies, and expiration that [Missions](missions.md) gives it.

The effect creates one Mission site per completion, never more and never none. It does not depend on the availability of L at the moment of completion, and it does not depend on whether the Faction of L is Eliminated: if the Faction became Eliminated before the completion, [Missions](missions.md) cancels the new Mission site at the end of the Turn advancement step Mission resolution of the same Advance turn, under [Cancellation](missions.md#cancellation). The effect changes nothing else, and it spends nothing.

The effect applies once for each completion of an Investigation of L. Another completion of an Investigation of the same Lead, e.g. after an earlier Mission from the Lead was Lost or an earlier Mission site of the Lead Expired, applies the effect again and creates another Mission site.

# Turn report

**v5 requirement:** The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds the Leads discovered in it: every Lead that is discovered in the World state that Advance turn commits and is not discovered in the World state before it, each by its GDR identifier. The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds the same list, unreduced. Both are [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report. An Advance turn that discovers no Lead holds an empty list.

# Player-visible information

**Inherited behavior:** Every value below is Player-visible information under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), for every discovered Lead, from the World state in which it is discovered, under [Lead discovery](#lead-discovery), whether or not the Lead is available. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| Every discovered Lead, with every property: `name`, `description`, `faction`, `requires`, and `on_completion` | Yes |
| The `required_progress` of every discovered Lead | Yes once an Investigation of the Lead has reached the threshold under [Assessment](investigations.md#assessment) in Investigations; otherwise no |
| The MissionSiteArchetype that each discovered Lead creates, including every property of that GDR, which [Missions](missions.md) states is Player-visible | Yes |
| For each prerequisite of each discovered Lead, whether it holds | Yes |
| For each discovered Lead, whether it is available, and for each of the four conditions of [Lead availability](#lead-availability), whether it holds, so that the Blocking conditions are known | Yes |
| For each discovered Lead, its [Lead status](#lead-status) | Yes |
| The Leads discovered in an Advance turn, under [Turn report](#turn-report) | Yes |

An undiscovered Lead is hidden completely: Player API returns neither the Lead nor any of its values, nor whether or how many undiscovered Leads exist, and no other channel under [Information boundary](../foundation/player-api.md#information-boundary) in Player API reveals it, e.g. the rejection of a Player action naming it, under [Starting an Investigation](investigations.md#starting-an-investigation) in Investigations. What [Missions](missions.md) makes Player-visible about a MissionSiteArchetype on its own is unchanged by this.

The player can therefore see why a discovered Lead is not available: every Blocking condition is reported, not only the first. For a discovered Lead, condition 1 and each of its prerequisites always hold, and are reported as holding. Whether an Investigation of a Lead can be started now, which also depends on whether the Lead already has an Active Investigation, is Player-visible under [Investigations](investigations.md). **Unknown versus absent:** Apart from a `required_progress` that [Assessment](investigations.md#assessment) has not yet revealed, which is reported as unknown, no value in the table above is unknown to the player. An undiscovered Lead is absent, not unknown: it is left out of every result. A discovered Lead with an empty `requires` is reported with an empty list of prerequisites, and condition 1 is reported as holding. A discovered Lead of an Eliminated Faction is reported as not available, with condition 4 as a Blocking condition and Lead status Archived.

# Edge cases and failure behavior

- **Lead with no prerequisites:** Condition 1 holds in every World state. The Lead is discovered from campaign creation, and available then unless conditions 2 to 4 fail ([Prerequisites](#prerequisites), [Lead discovery](#lead-discovery)).
- **Lead whose Faction does not exist in the Campaign:** This cannot occur for a Game build that passes [Lead GDR validation](#lead-gdr-validation), because every `faction` names a FactionArchetype and the initial Campaign state has one Faction for each FactionArchetype ([Lead availability](#lead-availability)). A World state in which it occurred would be an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract; condition 4 would not hold, so the Lead would not be available.
- **Investigation completes in the same Advance turn in which the Faction is Eliminated:** The Turn advancement step Investigation progress precedes Mission resolution, under [Turn Advancement](turn-advancement.md). The Faction is not yet Eliminated in the earlier step, so the effect creates its Initiative Mission site, which is Active. In Mission resolution, a Won Mission then eliminates the Faction, and at the end of the step [Missions](missions.md) cancels every Active Mission site targeting that Faction, including the new one. The new Mission site is Cancelled, and the Lead is not available afterwards because its Faction is Eliminated ([Completion effect](#completion-effect), [Cancellation](missions.md#cancellation)).
- **Investigation completes when the Faction is already Eliminated:** What becomes of an Investigation whose Lead's Faction becomes Eliminated is decided under [Lead no longer available](investigations.md#lead-no-longer-available). When it completes, the effect creates the Mission site, and [Missions](missions.md) cancels it in the same Advance turn; no World state shows it Active ([Completion effect](#completion-effect)).
- **Two Leads require the same MissionSiteArchetype:** Each of them holds its prerequisite from the World state in which the first Mission at a Mission site of it, targeting the Lead's Faction, is Won. Both can then become available together, can be investigated at the same time, and influence each other in no other way ([Prerequisites](#prerequisites)).
- **One win unlocks several Leads at once:** All Leads whose prerequisites all hold after that win become discovered in that same World state, and available if their other conditions hold; the Turn report lists every one of them ([What changes availability](#what-changes-availability), [Turn report](#turn-report)).
- **Faction Eliminated before a Lead is discovered:** Condition 1 of the Lead can still come to hold, e.g. through a Won Mission in the same Advance turn that eliminates the Faction; it then is discovered with Lead status Archived. After that Advance turn every Mission site targeting the Faction is Cancelled and no new Mission against it can be Won, so a Lead still undiscovered stays hidden for the rest of the Campaign ([Lead discovery](#lead-discovery), [Lead status](#lead-status)).
- **Faction Eliminated after discovery:** The Lead stays Player-visible for the rest of the Campaign, with Lead status Archived ([Lead discovery](#lead-discovery)).
- **Undiscovered Lead named by a [Player action](../foundation/engine-contract.md#player-actions-and-turns):** The action is rejected as if no Lead had that identifier, under [Starting an Investigation](investigations.md#starting-an-investigation) in Investigations ([Player-visible information](#player-visible-information)).
- **Prerequisite holds, Lead unavailable:** A Lead can have every prerequisite holding and still be unavailable, because its Faction is Eliminated or because a Mission from it is Won ([Lead availability](#lead-availability)).
- **Active or Abandoned Investigation:** Neither changes any condition of its Lead, and no Mission site is created. Whether a second Investigation of a Lead may start while one is Active, and whether an Abandoned Investigation's progress is resumed, are decided under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead) and [Abandonment](investigations.md#abandonment) ([What changes availability](#what-changes-availability)).
- **Cancelled Mission site:** The Lead stays unavailable, because a Mission site is Cancelled only when its Faction is Eliminated ([What changes availability](#what-changes-availability)).
- **Lost then Won:** A Lead whose Mission was Lost and that is investigated again creates another Mission site. When the Mission there is Won, condition 2 stops holding as for any other Won Mission from the Lead; the earlier Lost Mission stays Lost and blocks nothing ([What changes availability](#what-changes-availability)).
- **Won Response Mission:** It is from no Lead, because no Lead created its Mission site, so it makes condition 2 fail for no Lead; it makes hold every `mission_won` prerequisite that names its MissionSiteArchetype, of a Lead of its target Faction, and so can discover a Lead ([Missions from a Lead](#missions-from-a-lead), [Prerequisites](#prerequisites), [Lead discovery](#lead-discovery)).
- **Several Won Missions in one Advance turn:** Each makes condition 2 fail for the Lead it is from and makes the prerequisites it satisfies hold; the result does not depend on the order ([Prerequisites](#prerequisites)).
- **Game build without a Lead:** It passes [Lead GDR validation](#lead-gdr-validation). No Lead exists to be available and no Initiative Mission site is ever created.
- **Invalid GDRs:** A Game build that fails [Lead GDR validation](#lead-gdr-validation), e.g. with a cycle in its prerequisites, a `create_mission_site` of a MissionSiteArchetype of kind response, or two effects in `on_completion`, is defective and no Campaign is created from it.

# Acceptance examples

All examples use the Bootstrap GDR values from `content/leads-and-progression/leads.yaml` and `content/missions/mission_site_archetypes.yaml`, and a test Game build that supplies the Bootstrap GDRs without the FactionArchetypes `exalt` and `black_lotus` and their Leads, so that the Campaign has the one Faction Red Dawn, from `red_dawn`, unless an example states a test GDR. The values they read are:

| GDR | Values read |
| --- | --- |
| `locate_red_dawn_member` | `faction` `red_dawn`; `required_progress` 3; `requires` empty; `on_completion` `create_mission_site` `apprehend_member` |
| `locate_red_dawn_safehouse` | `faction` `red_dawn`; `required_progress` 6; `requires` `mission_won` `apprehend_member`; `create_mission_site` `raid_safehouse` |
| `locate_red_dawn_hq` | `faction` `red_dawn`; `required_progress` 10; `requires` `mission_won` `raid_safehouse`; `create_mission_site` `raid_hq` |
| `apprehend_member` | `kind` initiative; `expires_in_turns` 5 |
| `raid_safehouse` | `kind` initiative; `expires_in_turns` 8 |
| `raid_hq` | `kind` initiative; `expires_in_turns` 20; `on_win` `eliminate_target_faction` true |
| `foil_sabotage` | `kind` response |

In the examples, the three Leads are called by their identifiers, "member", "safehouse", and "hq" for `locate_red_dawn_member`, `locate_red_dawn_safehouse`, and `locate_red_dawn_hq`. "The Advance turn ending Turn t" is the Advance turn committed during Turn t; the Campaign starts in Turn 1. When an Investigation completes, under [Completion](investigations.md#completion), and each [Combat outcome](combat.md#combat-rounds-and-results) are fixed inputs, named as Investigations and [Combat](domain-model.md#combat) name them. [Instance IDs](../foundation/campaign-instances.md#glossary) i1, i2, ... name Investigations, s1, s2, ... name Mission sites, and m1, m2, ... name Missions; m1 is the Mission at s1, m2 the Mission at s2, and so on.

## Campaign creation

This example exercises [Prerequisites](#prerequisites), [Lead availability](#lead-availability), [Lead discovery](#lead-discovery), and [Lead status](#lead-status).

In the initial Campaign state there are no Investigations, no Mission sites, and no Missions. Red Dawn is not Eliminated.

| Lead | 1. Prerequisites hold | 2. No Mission Won | 3. No Unfinished Mission site | 4. Faction not Eliminated | Discovered | Available | Blocking conditions | Lead status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| member | Holds: `requires` is empty | Holds | Holds | Holds | Yes | Yes | None | Available |
| safehouse | Does not hold: no Mission at an `apprehend_member` Mission site is Won | Holds | Holds | Holds | No | No | 1 | None |
| hq | Does not hold: no Mission at a `raid_safehouse` Mission site is Won | Holds | Holds | Holds | No | No | 1 | None |

A Player-visible query of the Leads returns member alone, with its properties, its availability, the four conditions, and Lead status Available. It returns nothing about safehouse or hq, not even that further Leads exist ([Player-visible information](#player-visible-information)).

## The first Mission Won

This example exercises [Completion effect](#completion-effect), [Prerequisites](#prerequisites), [What changes availability](#what-changes-availability), [Lead discovery](#lead-discovery), [Lead status](#lead-status), and [Turn report](#turn-report).

Initial state: the state above, in Turn 1. The player starts Investigation i1 of member, under [Investigations](investigations.md).

- **During Turn 1, after the start:** i1 is Active. No condition of member reads Investigations, so member is still available with no Blocking condition; a second Investigation of member is nevertheless rejected while i1 is Active, under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead) in Investigations. Safehouse and hq are blocked by 1.
- **Advance turn ending Turn 4:** Investigation i1 completes (input from Investigations). The effect `create_mission_site` supplies `apprehend_member`, i1, and Red Dawn to Missions, which creates exactly one Initiative Mission site s1, Active, with target Faction Red Dawn. Member is not available; its Blocking condition is 3, because s1 is Active, and its Lead status is Inactive. Safehouse stays undiscovered, blocked by 1. The Turn report lists no discovered Lead.
- **Turn 5:** The player deploys a team to s1, so s1 and its Mission m1 are Deployed. Member is still blocked by 3.
- **Advance turn ending Turn 5:** The Combat outcome is Prevailed (input from Combat), so m1 becomes Won. Safehouse's condition 1 now holds, because s1 is from `apprehend_member` and targets Red Dawn, the Faction of safehouse, so safehouse is discovered. The Turn report of this Advance turn lists `locate_red_dawn_safehouse` as discovered.

| Lead | Available after the Advance turn ending Turn 5 | Blocking conditions | Lead status | Why |
| --- | --- | --- | --- | --- |
| member | No | 2 | Archived | m1, a Mission from member, is Won. Condition 3 holds, because m1 is Won. |
| safehouse | Yes | None | Available | Its prerequisite holds: m1, at s1 from `apprehend_member` targeting Red Dawn, is Won. |
| hq | No | 1 | None | Undiscovered: no Mission at a `raid_safehouse` Mission site is Won; m1 does not satisfy it. |

Member never becomes available again, in any later World state, and stays Player-visible as Archived.

## A Lost Mission and an Expired Mission site, then a Won Mission

This example exercises [What changes availability](#what-changes-availability), [Completion effect](#completion-effect), and [Prerequisites](#prerequisites).

Initial state: m1 is Won, in Turn 6, and safehouse is available (the state at the end of the previous example). Investigations i2, i3, and i4 of safehouse are started in Turns 6, 11, and 25 respectively.

- **Advance turn ending Turn 9:** i2 completes; a Mission site s2 from `raid_safehouse` is created, Active, with 8 Advance Turns until expiration. Safehouse is blocked by 3. In Turn 10 a team is deployed, creating m2, and in the Advance turn ending Turn 10 the Combat outcome is Retreated, so m2 is Lost. No Mission from safehouse is Won. Safehouse is available again, because conditions 1 to 4 all hold, so its Lead status goes from Inactive back to Available; hq stays undiscovered, blocked by 1.
- **Advance turn ending Turn 16:** i3 completes (started in Turn 11); a new Mission site s3 from `raid_safehouse` is created, Active. Safehouse is blocked by 3. No team is deployed to s3. s3 does not count down in the Advance turn that created it, so it is Expired in the Advance turn ending Turn 24. Safehouse is available again after that Advance turn.
- **Advance turn ending Turn 28:** i4 completes; Mission site s4 from `raid_safehouse` is created, Active. In Turn 29 a team is deployed, creating m4, and in the Advance turn ending Turn 29 the Combat outcome is Prevailed, so m4 is Won. Safehouse is never available again, with Lead status Archived; hq's condition 1 now holds, because s4 is from `raid_safehouse` and targets Red Dawn, so hq is discovered and available, and the Turn report of that Advance turn lists `locate_red_dawn_hq` as discovered. m2 stays Lost, and s3 never had a Mission.

## The last Lead and the elimination of Red Dawn

This example exercises [Lead availability](#lead-availability) and [Prerequisites](#prerequisites).

Initial state: m1 and m4 are Won, hq is available, in Turn 30. Investigation i5 of hq is started in Turn 30 and completes in the Advance turn ending Turn 40; Mission site s5 from `raid_hq` is created, Active. In Turn 41 a team is deployed, creating m5, and in the Advance turn ending Turn 41 the Combat outcome is Prevailed. m5 becomes Won, and Missions applies the `on_win` of `raid_hq`, which eliminates Red Dawn.

| Lead      | Available after the Advance turn ending Turn 41 | Blocking conditions | Lead status |
| --------- | ----------------------------------------------- | ------------------- | ----------- |
| member    | No                                              | 2, 4                | Archived    |
| safehouse | No                                              | 2, 4                | Archived    |
| hq        | No                                              | 2, 4                | Archived    |

Every prerequisite still holds, because Won Missions stay Won. Whether the Campaign has ended is decided under [Victory](panic-and-endings.md#victory).

## An Abandoned Investigation

This example exercises [What changes availability](#what-changes-availability) and [Lead availability](#lead-availability).

Initial state: the initial Campaign state, in Turn 1. The player starts Investigation i1 of member in Turn 1, and in Turn 2 assigns every [Agent](domain-model.md#agency-and-agents) of its [Current team](domain-model.md#leads-investigations-mission-sites-and-missions) elsewhere, so that i1 is Abandoned in the same Player action, under [Investigations](investigations.md).

Result: member is available with no Blocking condition in every World state of this example, before and after the order, because no condition reads Investigations, and no Mission site exists. While i1 is Active, a second Investigation of member is rejected under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead) in Investigations; after i1 is Abandoned, starting another Investigation i2 of member succeeds and creates a new Campaign instance, whose progress, under Investigations, does not resume the progress of i1.

## A Mission site Cancelled by the elimination of its Faction

This example exercises [Completion effect](#completion-effect), [What changes availability](#what-changes-availability), and [Edge cases and failure behavior](#edge-cases-and-failure-behavior). It uses a test Lead `test_lead` with `faction` `red_dawn`, `required_progress` 1, `requires` empty, and `on_completion` `create_mission_site` `apprehend_member`, supplied alongside the Bootstrap GDRs.

Initial state: Turn 60. A Mission site s6 from `raid_hq`, created by an Investigation i6 of hq that completed earlier, is Deployed, as is its Mission m6; `test_lead` has an Active Investigation i7. The following happens in the Advance turn ending Turn 60.

1. **Investigation progress:** i7 completes (input from Investigations). The effect creates Mission site s7 from `apprehend_member`, Active, with target Faction Red Dawn, which is not yet Eliminated.
2. **Mission resolution:** The Combat of m6 has the outcome Prevailed, so m6 becomes Won, and Red Dawn becomes Eliminated. After every Combat of the step, s7 is Active and its target Faction is Eliminated, so s7 becomes Cancelled, under [Cancellation](missions.md#cancellation).

Result: `test_lead` has no Won Mission, no Active Mission site, and no Deployed Mission. It is not available, because condition 4 does not hold; its only Blocking condition is 4. No World state shows s7 Active after that Advance turn.

## GDR validation

This example exercises [Lead GDR validation](#lead-gdr-validation). Each row independently changes the Bootstrap GDRs; the result is that the Game build is defective and no Campaign is created from it.

| Change | Rule violated |
| --- | --- |
| member's `requires` gains `mission_won` `raid_hq` | Prerequisites form no cycle |
| safehouse's `requires` names `raid_safehouse`, the MissionSiteArchetype it creates itself | Prerequisites form no cycle |
| hq's `requires` names `no_such_site` | Prerequisite references resolve |
| hq's `requires` names `raid_safehouse` twice | Prerequisite references resolve |
| member's `faction` is `apprehend_member`, which is not a FactionArchetype | Faction resolves |
| member's `required_progress` is 0 | Required progress is valid |
| member's `required_progress` is 2.5 | Required progress is valid |
| member has a property `difficulty` | Known properties |
| member's `create_mission_site` is `foil_sabotage`, a MissionSiteArchetype of kind response | Completion effect is valid |
| member's `on_completion` holds `create_mission_site` and a second effect | Completion effect is valid |
| member's `on_completion` is `create_mission` `apprehend_member`, an effect kind that is unknown | Completion effect is valid |
| safehouse's `requires` entry is `mission_lost` `apprehend_member` | Prerequisite kinds are known |
| member has a property `repeatable` | Known properties |

The unchanged Bootstrap GDRs satisfy every rule: the prerequisite relation leads from hq to safehouse to member and ends there; every `faction` is `red_dawn`; the Required progress values 3, 6, and 10 are whole numbers of at least 1; and each Lead creates a MissionSiteArchetype of kind initiative.

## Player-visible information

This example exercises [Player-visible information](#player-visible-information) and [Lead status](#lead-status).

In the World state after the Advance turn ending Turn 5 in [The first Mission Won](#the-first-mission-won), a Player API query of the Leads returns exactly member and safehouse. For safehouse it returns its name, description, `faction` `red_dawn`, `required_progress` as unknown, `requires` as a list of one prerequisite, `mission_won` `apprehend_member`, with the state that it holds; `on_completion` `create_mission_site` `raid_safehouse` together with every property of `raid_safehouse`; availability Yes; the four conditions, all holding; and Lead status Available. For member it returns availability No, condition 2 as the only condition not holding, and Lead status Archived. It returns nothing about hq. `getTurnReport()` lists `locate_red_dawn_safehouse` as discovered. The result is the same for the Session controller and an Autopilot AI. Only safehouse's `required_progress` is reported as unknown, because no Investigation of safehouse exists yet to reveal it under [Assessment](investigations.md#assessment); member's `required_progress` 3 is reported, because member is a Completed Lead, whose Completed Investigation revealed it.

# TODOs

- TODO (later): A prerequisite kind that holds once an Investigation of another Lead is Completed, i.e. Leads discovered through another Lead, as game-ts's dependency on a Lead, under [Prerequisites](#prerequisites).
- TODO (later): A condition that makes a Lead Inactive while another Lead has an Unfinished Mission site, as game-ts's negated dependency, under [Lead availability](#lead-availability).
- TODO (later): Repeatable Leads, under [What changes availability](#what-changes-availability). The Game designer's notes are in [Lead repeatability](../../../design-notes/lead-repeatability.md).
- TODO (later): Further prerequisite kinds, under [Prerequisites](#prerequisites).
- TODO (later): Further completion effect kinds, e.g. a Lead completion that gives information, money, funding, Agent improvement, or a Campaign objective directly, under [Completion effect](#completion-effect).
- TODO (later): Leads whose completion makes a Faction Eliminated directly, under [Completion effect](#completion-effect).
