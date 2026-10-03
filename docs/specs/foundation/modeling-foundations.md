# Modeling Foundations

| Metadata    | Value                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | MODEL                                                                                                                                                                           |
| Family      | Foundation                                                                                                                                                                      |
| Status      | Draft                                                                                                                                                                           |
| Scope       | Types, campaigns, Game Data Records (GDRs), Campaign instance construction and composition, identity and references, gameplay dependency direction, and historical preservation |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                                                                  |
| Review      | Batch 1; proposed rules awaiting user review                                                                                                                                    |

# Purpose and boundaries

Modeling Foundations defines the common language and basic contracts used to describe the game's data and behavior.

- **Game Design Brief** supplies the intent and strategic direction that these foundations give a modeling vocabulary.
- **Domain Model** applies that vocabulary to concrete game concepts and their structural relationships.
- **Mechanics specifications** define the detailed gameplay behavior of those concepts.
- **Engine Contract** defines execution guarantees built on these foundations.
- **History and Persistence** defines how campaign state and historical facts are retained.
- **Initial Campaign Content** supplies concrete game data within the model.
- **Numbers and Randomness** defines numerical and random behavior within the model.
- **Player Information** defines which campaign facts players can observe.
- **TypeScript Player API** exposes the model through a concrete programming interface.

# Relationships

- Used by [Domain Model](./domain-model.md)
- Used by [Engine Contract](./engine-contract.md)
- Used by [History and Persistence](./history-and-persistence.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Numbers and Randomness](./numbers-and-randomness.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

The subsections expose conceptual layers: foundational concepts, data described by those concepts, roles of that data,
and the Campaign instances and operations built from them.

## Foundational concepts

Type describes data, Campaign establishes the playthrough context, and Rule describes calculations and permitted behavior.

| Term     | Definition                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Type     | A named description of data structure and permitted values, including the Types of its constituent properties, collections, and references.                              |
| Campaign | A particular playthrough with its own evolving Campaign state and retained history.                                                                                      |
| Rule     | A declared statement governing a calculation or valid game behavior; for example, a formula or constraint. Further forms and any formal representation remain undecided. |

## Data within a Campaign

These concepts build on Type and Campaign: GDRs supply immutable shared data, while Campaign state describes one playthrough.

| Term                   | Definition                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| Game Data Record (GDR) | Concrete game data supplied by a game build, conforming to a declared Type and immutable during gameplay. |
| Campaign state         | Data describing one Campaign; for example, its Campaign instances, resources, and retained history.       |

## Campaign instances and their components

A Campaign instance has a declared Type and three components: Archetype, MutableState, and ImmutableState.
Archetype is the role of a GDR within this composition. Instance ID distinguishes individual Campaign instances.
A Campaign instance constructor is a Rule that constructs a Campaign instance and initializes its components.

| Term                          | Definition                                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign instance             | A particular occurrence within a campaign of a declared Type, composed of an Archetype, MutableState, and ImmutableState.                                                                                                                   |
| Archetype                     | A GDR supplying shared characteristics and construction defaults for Campaign instances constructed from it.                                                                                                                                |
| MutableState                  | Campaign instance-specific data whose properties are permitted to evolve under their declared gameplay rules.                                                                                                                               |
| ImmutableState                | Campaign instance-specific data established during construction and preserved for the Campaign instance's lifetime, always including its Instance ID.                                                                                       |
| Instance ID                   | An identifier for a Campaign instance, unique within a declared identity scope and stable during its lifetime under [MODEL-002](#model-002--identity).                                                                                      |
| Campaign instance constructor | A Rule that declares its inputs and dependencies, identifies the Type of the returned Campaign instance, and establishes a new Campaign instance's initial components. It need not be a language-level constructor or public API operation. |

## Value classification, history, and observation

These concepts describe how values are established, retained, and exposed within the preceding model.

| Term                       | Definition                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| Authoritative value        | A value treated as established truth rather than recomputed from other values.                 |
| Derived value              | A value calculated deterministically from Authoritative values and the current rules and GDRs. |
| History                    | Retained data describing past Campaign state or events. Rules and reports may consult History. |
| Committed state            | Complete Campaign state before or after an accepted command, not intermediate processing.      |
| Player-visible information | Information deliberately exposed by the engine to an ordinary player.                          |

## Rejected terms and synonyms

- **Template:** not a modeling term or a synonym for GDR or Archetype. Use GDR when naming shared immutable data, and Archetype when naming its role in Campaign instance composition. Describe initialization directly.
- **Definition:** not a modeling category or a substitute for Type or GDR. Use Type for a named data description and GDR for concrete shared immutable data. The ordinary word remains valid when discussing a term’s definition.

# Concepts and contract

## From GDRs to a running campaign

A campaign separates shared game data from the facts of one playthrough. GDRs supply the shared data and
remain unchanged during play. Campaign state records what is happening in that playthrough and what must be remembered
about its past. Two campaigns can use the same GDRs while developing different Campaign state.

Rules connect the two. A calculation can read GDRs together with current campaign values. A Campaign instance constructor can use
GDRs to create an individual Campaign instance. Later rules can change that Campaign instance's mutable properties while
preserving its identity and fixed facts. Not every use of GDRs creates a Campaign instance, and not every campaign value
needs independent identity.

Types describe the data on both sides of this distinction. A Type describes what a value contains; a GDR
provides concrete shared values; a Campaign instance represents one particular occurrence. An Archetype is the GDR
supplying a Campaign instance's shared characteristics. The following sections build up these relationships from direct
GDR use to Campaign instances with multiple GDR references.

```mermaid
flowchart TB
    Types["Types: descriptions of data"]
    subgraph Content["GDRs: shared and immutable"]
        Archetypes["Archetypes"]
        OtherContent["Other GDRs"]
    end
    Rules["Rules: calculations, construction, and gameplay"]
    subgraph Campaign["Campaign state: one playthrough"]
        Instances["Campaign instances: individual occurrences"]
        Values["Other values and retained history"]
    end
    Types -.->|describe| Content
    Types -.->|describe| Campaign
    Content -->|supplies inputs to| Rules
    Campaign -->|supplies current values to| Rules
    Rules -->|construct and govern changes to| Instances
    Rules -->|calculate, update, or retain| Values
    Archetypes -->|supply shared characteristics to| Instances
```

## MODEL-007 — Gameplay dependency direction

Within gameplay, the top-level Campaign instance must be the ownership root for the current campaign. Gameplay
functions, including Campaign instance constructors, must not accept that top-level Campaign instance as an input or
depend on access to it. A context object, global, or captured reference must not provide indirect access to the
top-level Campaign instance. Contained Campaign instances must not hold reverse references to that top-level Campaign
instance. Gameplay functions must receive only the specific values, GDRs, contained Campaign instances,
or narrowly scoped dependencies needed for their operations, without exposing the top-level Campaign instance.

A Campaign instance constructor must return the constructed Campaign instance; its caller establishes containment.
These constraints apply inside gameplay after campaign creation. They do not prescribe external campaign creation,
save/load, or engine interfaces.

## Types describe model data

A Type names a data description rather than a particular value. It can describe a simple value, a collection, or a
structured set of properties. Each property has a declared Type, and a reference identifies the Type of data it
expects to resolve. Types describe GDRs and Campaign instances as well as their constituent values;
having a Type does not itself give a value independent identity.

For readers familiar with TypeScript, its `type` declarations offer an intuition for naming and composing data
descriptions. Here, Type is an independently defined modeling concept; these contracts do not use TypeScript syntax
or rely on its type system.

Structure, initialization, and ongoing validity answer different questions. A health property can be an integer;
a Campaign instance constructor can initialize it from shared GDRs; gameplay rules can constrain its later range. Matching the
structure alone does not establish campaign membership, resolve references, or prove that initialization was valid.
Likewise, matching fields do not make a GDR valid for every reference: references name the expected Type.

## Roles of GDRs

GDRs can serve the following five roles. The roles can overlap; they do not define separate Types or required
implementation interfaces. The following sections illustrate these roles, beginning with direct use and then construction
and references.

| Role                   | Relationship to Rules and Campaign state                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Calculation parameter  | A Rule reads a GDR when calculating a value.                                                            |
| Initialization source  | A Rule uses a GDR to establish an initial value in Campaign state; later changes follow gameplay rules. |
| Archetype              | A GDR supplies shared characteristics and construction defaults for Campaign instances.                 |
| Referenced GDR         | A Campaign instance references a GDR for a purpose other than supplying its Archetype.                  |
| Key for campaign facts | Campaign state associates facts with the identity of a GDR while the GDR remains immutable.             |

A Rule describes the calculation or behavior; a GDR supplies data that the Rule reads. These roles do not
require Rules to be stored as objects or grouped into a Ruleset Type.

## Using GDRs directly

Consider an illustrative upkeep calculation for agents serving in a campaign. Its complete local setup is:

| Element             | Modeling role       | Meaning in this example                                                     |
| ------------------- | ------------------- | --------------------------------------------------------------------------- |
| UpkeepRate          | Type                | Describes a nonnegative integer amount of money per serving agent per turn. |
| Standard upkeep     | GDR                 | Has Type UpkeepRate and value 2 money per serving agent per turn.           |
| Serving-agent count | Authoritative value | Value in Campaign state, currently 3.                                       |
| Upkeep calculation  | Rule                | Upkeep for one turn equals the rate multiplied by the serving-agent count.  |
| Total upkeep        | Derived value       | 2 × 3 = 6 money for this turn.                                              |

The rule reads the GDR directly. Applying the upkeep charge changes campaign money without constructing an upkeep
Campaign instance. The rate remains 2 when the serving-agent count changes. The formula and its input GDR are
distinct: a Rule is not automatically a GDR or an object stored in Campaign state.

GDRs can also supply an initial value. For example, an initial-capacity GDR of 4 can initialize a campaign's
mutable capacity to 4. If an upgrade later changes capacity to 5, reading capacity returns 5; it does not copy 4 from
the GDR again. This is initialization, whereas upkeep is an ongoing calculation. Neither illustrative value selects
a production balance parameter.

## MODEL-001 — Campaign instance composition

An Archetype supplies shared characteristics for particular Campaign instances. Consider an illustrative Enemy Type and a
Thug GDR of EnemyArchetype whose base health is 10. Creating two enemies from Thug produces two Campaign instances
of Enemy, not two new Types and not two mutable copies of Thug. Their Instance IDs are `enemy_1` and `enemy_2`;
both Campaign instances have Type Enemy. The numbered names identify Campaign instances, not Types.

Every Campaign instance must have exactly three conceptual components: Archetype, MutableState, and ImmutableState,
with structures described by its declared Type. Every GDR must match its declared Type.
The complete composition of the first enemy in this example is:

| Component      | Purpose                                                     | Enemy enemy_1 at construction                    |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| Archetype      | Shared immutable characteristics and construction defaults. | Thug, an EnemyArchetype GDR with base health 10. |
| MutableState   | Campaign instance-specific properties permitted to change.  | Current health 10.                               |
| ImmutableState | Campaign instance-specific facts fixed at construction.     | Instance ID enemy_1.                             |

```mermaid
flowchart LR
    enemy_type["Type: Enemy"]
    enemy_archetype_type["Type: EnemyArchetype"]
    thug_gdr["GDR: Thug · base health 10"]
    thug_gdr -->|has Type| enemy_archetype_type
    subgraph enemy_1["Campaign instance enemy_1"]
        enemy_1_archetype["Archetype: Thug"]
        enemy_1_mutable_state["MutableState: health 10"]
        enemy_1_immutable_state["ImmutableState: Instance ID enemy_1"]
    end
    subgraph enemy_2["Campaign instance enemy_2"]
        enemy_2_archetype["Archetype: Thug"]
        enemy_2_mutable_state["MutableState: health 10"]
        enemy_2_immutable_state["ImmutableState: Instance ID enemy_2"]
    end
    enemy_1 -->|has Type| enemy_type
    enemy_2 -->|has Type| enemy_type
    enemy_1_archetype -->|resolves to| thug_gdr
    enemy_2_archetype -->|resolves to| thug_gdr
```

The components describe meaning, not storage. They can be embedded or resolved through references. Sharing an
archetype does not require inheritance or copies of GDRs, and Campaign instances must have independent Campaign instance-specific components; sharing an archetype must not cause them to share MutableState.
Gameplay must not modify GDRs, replace a Campaign instance's archetype, or modify its ImmutableState, including owned nested data. MutableState properties must be permitted to change under
their rules; they need not change in every playthrough or remain changeable after a terminal lifecycle transition.

Immutable references belong in ImmutableState; following a reference does not transfer ownership of the target’s data
([MODEL-003](#model-003--references)). Structural compatibility alone does not establish a valid Campaign instance or satisfy runtime invariants.

## MODEL-006 — Campaign instance construction

Each Campaign instance constructor must declare its input parameters and dependencies and identify the Type of the
returned Campaign instance. Every new Campaign instance must initialize all three components, receive a fresh Instance ID
within its declared scope, and satisfy its declared structure and initialization rules. Dependencies must include any
GDR selection, Instance ID allocation state, or randomness actually used by the constructor.

The illustrative Campaign instance constructor `constructEnemy(archetype, instanceId)` receives an EnemyArchetype
GDR and a fresh Instance ID and returns an Enemy. It fixes Archetype to the supplied GDR, records
the supplied Instance ID in ImmutableState, and initializes current health in MutableState to the GDR's base
health. All inputs are supplied directly; `constructEnemy` uses no randomness, performs no GDR lookup, and
does not allocate an Instance ID or access the top-level Campaign instance.

The caller supplies an Instance ID that is fresh within this example's campaign-wide scope and attaches the returned
Enemy to the owning Mission. In the following language-independent pseudocode, `mission` denotes a Mission already
contained in the top-level Campaign instance, and `thug` denotes the Thug GDR:

```text
enemy = constructEnemy(thug, freshInstanceId)
append enemy to mission.enemies
```

The caller changes the Mission's collection; `constructEnemy` only constructs and returns the Enemy. Before the
enclosing operation publishes Committed state, the caller must establish ownership and any required relationships.
That Committed state must satisfy all applicable invariants.
The Instance ID allocation mechanism remains unspecified. Multiple Campaign instance constructors can return Campaign instances of the
same Type, provided each declares its inputs, dependencies, and initialization rules. Passing the top-level Campaign instance to `constructEnemy`
instead of supplying the required inputs would violate [MODEL-007](#model-007--gameplay-dependency-direction).

A constructor contract must distinguish initialization rules from structural constraints and gameplay invariants that
continue to apply after creation. Concrete constructor behavior belongs in the gameplay specification responsible for
the creation operation; consuming specifications must identify those owners.

For this example, base health is a positive integer and current health must remain an integer between zero and base
health, inclusive. Construction starts enemy_1 and enemy_2 at 10. Damage changes enemy_1's health to 7; enemy_2's health and Thug's base
health remain 10. Both identities remain unchanged. Starting an enemy at 7 would satisfy the ongoing range but violate
the initialization rule of `constructEnemy`; starting it at 11 would violate both.

## MODEL-002 — Identity

Every Campaign instance must have an Instance ID in ImmutableState, unique within its declared identity scope and stable
for its lifetime. Distinct Campaign instances in the same scope and timeline must have distinct IDs. The ID distinguishes
the individual Campaign instance, and the shared Thug GDR cannot supply a distinct identity for every enemy. In the example's
campaign-wide scope, enemy_2 cannot reuse enemy_1's Instance ID. Each consuming specification must declare its identity scopes explicitly.

GDR references must identify the expected GDR Type and GDR ID. Relationships must use
explicit references; rules must not parse display names or identifier text to discover relationships. This specifies
reference meaning, not a serialized discriminator field.

Instance IDs are timeline-scoped: a discarded future is not another live campaign. Lookup and history restoration must
preserve the restored Campaign instance’s identity rather than allocate a new one. This convention chooses neither an
ID generation algorithm nor a restoration procedure.

For example, undoing damage restores enemy_1's
health to 10; redoing it restores 7, with the same identity and immutable facts. Undoing a Campaign instance's creation
removes it and its references from that timeline; redo restores the same Campaign instance and fixed facts.

## MODEL-003 — References

All Committed state Campaign instance references must resolve to a Campaign instance of the expected Type in the same
campaign. GDR references must resolve to a GDR of the expected Type supplied by the current game build.
References to historical Campaign instances, including terminal lifecycle states, must remain resolvable. Storage may be
compacted provided required facts and references remain available; full snapshots need not be retained forever.

References identify particular GDRs or Campaign instances and their expected Types. Thug has a GDR
identity as an EnemyArchetype GDR; enemy_1 has an Instance ID as an Enemy Campaign instance. A reference to a missing GDR is
invalid, as is resolving an EnemyArchetype reference to GDRs of another Type merely because some fields match.
Structural compatibility alone does not prove reference validity.

For a reference stored in a Campaign instance, its placement depends on whether the reference itself can change.
An immutable reference must belong in ImmutableState: construction establishes its target, and gameplay cannot replace or clear
that reference. A mutable reference must belong in MutableState: gameplay rules may replace its target or clear the
reference when permitted. This classification is independent of whether the referenced data can change.

For example, an Investigation's immutable Lead reference belongs in the Investigation's ImmutableState. An illustrative
Agent's reference to the Mission to which the Agent is currently deployed belongs in the Agent's MutableState if
gameplay permits deployment changes. Changing that reference changes which Mission the Agent references; it does not
modify either Mission. This example establishes no deployment eligibility or timing rules.

For example, consider a variant `constructEnemy(archetype, instanceId, missionReference)` whose additional input is a
typed reference to a Mission mission_1 representing a task. The Campaign instance constructor initializes that immutable reference in enemy_1's
ImmutableState at construction. Mission follows the same three-component contract
and can have a mutable collection of participating enemies. Its membership can change while enemy_1's immutable Mission
reference continues to resolve to mission_1. The immutable reference does not prevent changes to mission_1's
MutableState; following a reference does not transfer ownership of the referenced Campaign instance's data.

Lead is an immutable GDR in these examples. Its immutability follows from being a GDR, not from
the Investigation's reference being immutable. Mutable campaign facts associated with a Lead belong in Campaign state,
as illustrated by the completion records in the next section; changing those facts does not replace the Lead reference.

Mutability of a reference does not depend on whether it is represented by an identifier. Ordinary nested values and retained records do not become
Campaign instances simply because they are stored, immutable, or associated with an identifier.

## Archetypes and other referenced GDRs

A Campaign instance can refer to GDRs for a purpose other than supplying its Archetype. Consider an illustrative Lead and an Investigation of that Lead. The complete comparison needed here is:

| Example concept        | Modeling role                                                                                                                                              | Question it answers                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Lead                   | GDR representing a Lead to pursue.                                                                                                                         | Which Lead can be pursued?                                                        |
| Investigation          | Campaign instance for investigation of a given Lead, with its own Instance ID, progress in MutableState, and a immutable Lead reference in ImmutableState. | Which Investigation concerns that Lead, and how has it progressed?                |
| InvestigationArchetype | GDR used as an Investigation's Archetype, supplying shared characteristics and construction defaults independently of the referenced Lead.                 | What shared characteristics and construction defaults does the Investigation use? |

Suppose Lead lead_1 is referenced by Investigation investigation_1, constructed with InvestigationArchetype investigation_archetype_1. Its ImmutableState contains its
Instance ID and immutable Lead reference; its MutableState contains lifecycle initialized to active and progress initialized to 0. The archetype remains the separate shared
component. Adding the Lead reference does not create a fourth component or make lead_1 the Investigation's archetype.

For this example, investigation_1 reaches progress 2 and is abandoned. A new Investigation investigation_2 at lead_1 starts at progress 0 with its own Instance ID.
Use archetype investigation_archetype_2 for investigation_2 to show that the Investigation's Lead reference and Archetype are independent relationships. These
are symbolic GDRs without selected production fields or mechanics. The example assumes both combinations are
permitted; it does not define eligibility or concurrency rules.

```mermaid
flowchart LR
    lead_1["Lead GDR: lead_1"]
    investigation_archetype_1["InvestigationArchetype investigation_archetype_1"]
    investigation_archetype_2["InvestigationArchetype investigation_archetype_2"]
    subgraph investigation_1["Investigation investigation_1"]
        investigation_1_archetype["Archetype: investigation_archetype_1"]
        investigation_1_immutable_state["ImmutableState: Instance ID investigation_1, Lead lead_1"]
        investigation_1_mutable_state["MutableState: abandoned, progress 2"]
    end
    subgraph investigation_2["Investigation investigation_2"]
        investigation_2_archetype["Archetype: investigation_archetype_2"]
        investigation_2_immutable_state["ImmutableState: Instance ID investigation_2, Lead lead_1"]
        investigation_2_mutable_state["MutableState: active, progress 0"]
    end
    investigation_1_archetype -->|resolves to| investigation_archetype_1
    investigation_2_archetype -->|resolves to| investigation_archetype_2
    investigation_1_immutable_state -->|immutable reference| lead_1
    investigation_2_immutable_state -->|immutable reference| lead_1
```

Both Investigations can share lead_1 without sharing progress. Retargeting investigation_1 to another Lead or replacing investigation_archetype_1 after construction
would violate its fixed facts. Using lead_1 as its archetype would fail the expected InvestigationArchetype reference,
regardless of whether some fields match.

If investigation_2 later completes, Campaign state can retain a completion record associated with lead_1 and investigation_2. lead_1 remains unchanged;
the record belongs to the campaign. The number of completions for lead_1 can then be derived from those records. GDRs
can thus identify the subject of an activity and key campaign facts without becoming mutable itself.

## MODEL-005 — Value classification

An Authoritative value is treated as established truth. A Derived value is calculated from Authoritative values
and current rules and GDRs. This classification is separate from mutability. Shared base health and a
recorded Instance ID can be Authoritative values even though neither changes during gameplay.

Each specification using these concepts must declare which of its values are Authoritative values and which are Derived
values, using the glossary definitions. Caching a current calculation must not change its classification as a Derived value.
Classification must be independent of player visibility: either kind may be hidden from the player. Retaining a past
calculation as a historical fact follows [MODEL-004](#model-004--historical-fact-preservation).

In the enemy example, declare each enemy's current health an Authoritative value and their total current health a Derived value.
Initially the total is 20. After enemy_1 takes damage, it is 17. Caching the total does not make it an Authoritative value, and hiding
either the individual health or the total from the player does not change the classification.

Similarly, the recorded completion of investigation_2 is an Authoritative value recording a historical fact. The completion count for lead_1 is a Derived value:
it is 1 after investigation_2 completes, and investigation_1's abandonment does not add a completion. Facts associated with GDRs belong to
the campaign rather than being edits to those GDRs.

## MODEL-004 — Historical fact preservation

A past value cannot always be recovered from its current replacement. For example, a report that needs enemy_1's original
health must retain that value of 10 or the original inputs needed to reconstruct it. Current health of 7 is not a
replacement for that historical fact. When a rule or report needs the historical basis, the original inputs or historical
value must be preserved; required historical values must not be overwritten with current calculations. This does not
require retaining every intermediate calculation or every possible chart.

When a Campaign instance no longer participates in current gameplay, data required by rules, reports, or retained
references must remain in History rather than being deleted. For example, if enemy_1 no longer participates in a Mission,
a retained reference to enemy_1 must still resolve. Retention does not introduce a separate lifecycle state or transition
name or require moving data into a separate storage location. Consuming specifications must declare which lifecycle
changes require retention and which data must remain available. The Instance ID and relationships needed to resolve
retained references must be preserved under [MODEL-002](#model-002--identity) and [MODEL-003](#model-003--references).
An evolving collection can contain immutable historical records: adding a completion record does not permit rewriting
an earlier record.

# Edge cases and failure behavior

Passing the top-level Campaign instance into gameplay, directly or through another dependency, violates
[MODEL-007](#model-007--gameplay-dependency-direction). The same applies to a reverse reference from a contained
Campaign instance to the top-level Campaign instance.

| Case                                                                                                                     | Result / owner                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Missing component, incorrect structure, or mutation of immutable data                                                    | Invalid data or Campaign state under [MODEL-001](#model-001--campaign-instance-composition).                                                           |
| Campaign instance constructor omits an input, dependency, Type of the returned Campaign instance, or initialization rule | Incomplete Campaign instance constructor contract under [MODEL-006](#model-006--campaign-instance-construction).                                       |
| Duplicate Instance ID, missing reference, or wrong expected Type                                                         | Invalid Campaign state under [MODEL-002](#model-002--identity)/[MODEL-003](#model-003--references); never infer a replacement by name.                 |
| Campaign instance is historical, including terminal lifecycle states                                                     | Required historical references still resolve under [MODEL-003](#model-003--references); storage may be compacted without losing required facts.        |
| A later Campaign instance belongs only to a discarded future                                                             | Instance IDs are timeline-scoped under [MODEL-002](#model-002--identity); committed references must resolve under [MODEL-003](#model-003--references). |
| A current value differs from the retained original value                                                                 | Retain the historical basis required by the result/report under [MODEL-004](#model-004--historical-fact-preservation).                                 |

# Open decisions

[MODEL-001](#model-001--campaign-instance-composition), [MODEL-002](#model-002--identity), [MODEL-003](#model-003--references), [MODEL-004](#model-004--historical-fact-preservation), [MODEL-005](#model-005--value-classification), and [MODEL-006](#model-006--campaign-instance-construction) remain proposed rules awaiting review.
[MODEL-007](#model-007--gameplay-dependency-direction) records the required gameplay dependency boundary.
Consuming specifications own their concrete game Types, identity scopes, Campaign instance constructor behavior, and gameplay rules.
The illustrations here do not settle those decisions or select production GDR fields and allowed combinations.

Further Rule forms and any formal representation remain undecided. The five GDR roles are explanatory, not a
new implementation taxonomy.
