# Campaign Modeling Contract

| Metadata                 | Value                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID                  | MODEL                                                                                                                                                        |
| Family                   | Foundation                                                                                                                                                   |
| Status                   | Accepted                                                                                                                                                     |
| Acceptance reference     | Project owner approval in this task: "OK mark the mf as Accepted and update any other docs as appropriate"                                                   |
| Reorganization reference | Project owner requested the Core Concepts split and relocation of Session in this chat; retained campaign modeling rules preserve their recorded acceptance. |
| Conventions              | [Specification conventions](../governance/spec-conventions.md)                                                                                               |

# Purpose and boundaries

Define campaign-data composition, construction, identity, reference integrity, value classification, and historical preservation. These constraints apply to Campaign state, not the complete engine API hierarchy. Session authority, delegation orchestration, API signatures, and interface behavior belong to their owning contracts.

The Game Design Brief supplies strategic intent; mechanics specifications own detailed gameplay behavior.

- Uses [Core Concepts](./core-concepts.md) for shared modeling vocabulary and value meanings applied to campaign-data constraints.
- Refines [Engine Contract](./engine-contract.md) by specifying campaign-data composition, construction, identity, reference, and historical-preservation constraints for campaign integrity and continuation guarantees.
- Used by [Domain Model](./domain-model.md) for Campaign instance composition, construction, and identity/reference constraints applied to game concepts.
- Used by [History and Persistence](./history-and-persistence.md) for identity, reference resolution, and historical-preservation constraints applied to restoration.
- Used by [Initial Campaign Content](../content/initial-campaign.md) for campaign composition and GDR modeling roles used by starting data.
- Used by [Numbers and Randomness](./numbers-and-randomness.md) for campaign identity and value-classification constraints preserved by numeric execution.
- Used by [Player Information](../interfaces/player-information.md) for value-classification and historical-preservation constraints applied to exposed facts.
- Used by [TypeScript Player API](../interfaces/typescript-api.md) for Campaign instance construction, composition, and identity/reference constraints preserved by public operations.

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Domain Model](./domain-model.md)
- Used by [History and Persistence](./history-and-persistence.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Numbers and Randomness](./numbers-and-randomness.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

Shared modeling and execution vocabulary is owned by [Core Concepts](core-concepts.md#glossary).
The terms below add campaign-specific composition; Instance ID is defined by Core Concepts and its campaign identity
constraints are specified under [Campaign instances](#campaign-instances).

| Term                          | Definition                                                                                                                                                                                                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign instance             | A particular occurrence within a Campaign of a declared Type, with Instance ID, an Archetype reference, Constants, and State.                                                                                                                                                                              |
| Archetype                     | A GDR referenced by a Campaign instance, supplying shared characteristics and construction defaults. It is shared immutable data, never instantiated; the Campaign instance’s Archetype reference is fixed during construction.                                                                            |
| State                         | Values owned by this Campaign instance that may change under gameplay rules. State is specific to this Campaign instance and is distinct from Campaign state, which describes the whole playthrough.                                                                                                       |
| Constants                     | Values owned by this Campaign instance that remain fixed for its lifetime. A reference stored in Constants has a fixed target; it does not require the target’s State to remain fixed.                                                                                                                     |
| Campaign instance constructor | An operation that creates and returns a new Campaign instance. Its signature specifies input parameters and the return Type; its behavioral specification defines dependencies and initialization, which its implementation performs. It need not be a language-level constructor or public API operation. |

## Rejected terms and synonyms

- **Field, member, key:** use Property from Core Concepts for a named component of a structured Type; unrelated uses retain their ordinary meaning.
- **Template:** use GDR when naming immutable game data, and Archetype when naming its campaign composition role. Describe initialization directly.
- **Definition:** this is not a modeling category or a synonym for Type or GDR. Ordinary prose may discuss a term's definition.

# Concepts and contract

## Campaign data integrity refinement

This document refines [Campaign data integrity](engine-contract.md#campaign-data-integrity),
[Continuation state](engine-contract.md#continuation-state), and
[Committed state integrity](engine-contract.md#committed-state-integrity) in Engine Contract by specifying the
composition, initialization, identity, reference, and historical-preservation constraints that campaign creation,
committed mutations, and restoration must preserve. It supplies campaign modeling detail without defining API authority
or execution sequencing. Core Concepts supplies the shared vocabulary used to express these constraints.

## Campaign initialization

Campaign initialization receives setup inputs, immutable Game Data Records (GDRs), and the Ruleset supplied by the
Game build. Campaign instance constructors initialize the campaign-specific data from those inputs. GDRs supply data,
Rules specify calculations and permitted behavior, and Campaign instance constructors specify construction and
initialization. Neither a GDR nor a Campaign instance constructor is itself a Rule. Exact starting data and balance
values are outside this document's ownership. Session lifecycle and publication of Committed state belong to Engine Contract.

## Campaign instances

### Campaign instance structure

A Campaign instance Type always has exactly four properties: Instance ID, an Archetype reference, Constants, and State.

### Campaign instance construction

Each Campaign instance constructor has declared input parameters and a return Type, which is of the constructed Campaign instance. Its specification defines its
dependencies and how the returned Campaign instance’s Instance ID, Archetype reference, Constants, and State are
initialized, including assignment of a fresh Instance ID. The implementation performs this initialization.
For example, a Campaign instance constructor implementation can depend on:

- One or more GDRs serving as Archetypes.
- A random generator.
- An ID generator.

### Gameplay dependency direction

Gameplay functions, including Campaign instance constructors, must receive only necessary inputs and dependencies,
without direct or indirect access to the top-level Campaign instance. Contained Campaign instances must not refer
back to that root. These restrictions exclude campaign creation, save/load, and external engine interfaces.
This specifies the isolation requirement in Engine Contract's [Campaign data integrity](engine-contract.md#campaign-data-integrity).

### Campaign instance identity

Instance IDs are unique within their explicitly declared scope and stable for the Campaign instance’s lifetime.
Restoration, including undo/redo, preserves identity and immutable facts; uniqueness applies within the Campaign’s current timeline, excluding discarded futures.

## References

References identify a particular target and its expected Type. In Committed state, Campaign instance references must resolve
within the same Campaign; GDR references identify the GDR ID and must resolve against the current Game build.
Required historical references remain resolvable. Relationships must not be inferred from display names or identifier text.

References that can change belong in State; fixed references belong in Constants. Instance ID and the Archetype reference
are separate immutable properties. Reference mutability is independent of the target’s mutability.

## Authoritative and Derived values

An Authoritative value is treated as established truth. A Derived value is calculated from Authoritative values
and current rules and GDRs. This classification is separate from mutability. Shared base health and a
recorded Instance ID can be Authoritative values even though neither changes during gameplay.

Each specification using these concepts must declare which of its values are Authoritative values and which are Derived
values, using the glossary definitions. Caching a current calculation must not change its classification as a Derived value.
Classification must be independent of player visibility: either kind may be hidden from the player. Retaining a past
calculation as a historical fact follows [Historical fact preservation](#historical-fact-preservation).

In the enemy example, declare each enemy's current health an Authoritative value and their total current health a Derived value.
Initially the total is 20. After enemy_1 takes damage, it is 17. Caching the total does not make it an Authoritative value, and hiding
either the individual health or the total from the player does not change the classification.

Each Investigation Campaign instance has a Lead reference property within its Constants property and a lifecycle property
within its State property. The values of these two properties are Authoritative values. The completion count for a
Lead is a Derived value: count the Investigation Campaign instances whose Lead reference property identifies
that Lead GDR and whose lifecycle property has the value Completed. The count for lead_1 is 1 after investigation_2 completes; investigation_1’s Abandoned lifecycle
excludes it. No separate completion record or stored Authoritative completion count is required.

## Historical fact preservation

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
retained references must be preserved under [Campaign instances](#campaign-instances) and [References](#references).
An evolving collection can contain immutable historical records: adding a Battle result does not permit rewriting
an earlier retained Battle result.

## Roles of GDRs

GDRs can serve the following five roles. The roles can overlap; they do not define separate Types or required
implementation interfaces. The following sections illustrate each role.

| Role                   | Relationship to Rules and Campaign state                                                                                | Example                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Initialization source  | The engine passes a GDR’s values to a constructor implementation to initialize Campaign state.                          | The engine passes starting-money GDR value 100 to initialize Agency money.  |
| Calculation parameter  | The engine reads a GDR when applying a calculation Rule.                                                                | The engine reads the rate from the Standard upkeep GDR to calculate upkeep. |
| Archetype              | A GDR supplies shared characteristics and construction defaults used by a Campaign instance constructor implementation. | The engine constructs an Enemy using base health 10 from the Thug GDR.      |
| Referenced GDR         | A Campaign instance holds a reference to a GDR for a purpose other than supplying its Archetype.                        | An Investigation holds a reference to the Lead GDR it pursues.              |
| Key for campaign facts | Campaign state holds facts keyed by a GDR’s identity while the GDR remains immutable.                                   | The engine records completions against a Lead GDR’s identity.               |

## GDR role: initialization source

Consider an illustrative Agency construction with starting money:

| Element                | Modeling role                 | Meaning in this example                                                                                      |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Money                  | Type                          | Describes a nonnegative integer amount of money.                                                             |
| Starting money         | GDR                           | Has Type Money and value 100.                                                                                |
| Agency construction    | Campaign instance constructor | Specifies construction of an Agency Campaign instance with money in State initialized to the supplied value. |
| Agency                 | Campaign instance             | The new Agency Campaign instance returned by the constructor implementation, with money 100 in State.        |
| Agency money           | Authoritative value           | Initialized to 100 in the Agency Campaign instance’s State.                                                  |
| Initial Campaign state | Committed state               | Contains the Agency Campaign instance when campaign creation completes.                                      |

During campaign creation, the engine reads 100 from the starting-money GDR and passes it to the Agency constructor
implementation. The implementation constructs an Agency Campaign instance and initializes its money in State
to 100. The initial Campaign state contains that Agency Campaign instance.
The engine publishes the initial Committed state when campaign creation completes.

```mermaid
flowchart LR
    Type["Type: Money"] -.->|describes| GDR["GDR: Starting money · value 100"]
    GDR -->|starting money 100| Engine["Engine invokes Agency constructor implementation"]
    Constructor["Campaign instance constructor:<br/>new Agency with money initialized to supplied value"] -->|specifies construction| Engine
    Engine -->|constructs| Agency["Agency Campaign instance"]
    Agency -->|State contains| Money["Authoritative value:<br/>money 100"]
    Agency -->|included in| State["Initial Campaign state:<br/>Committed state"]
```

If an expense later reduces Agency money to 90, the engine reads 90 from the Agency Campaign instance’s State.
The starting-money GDR still contains the construction input of 100.

## GDR role: calculation parameter

Consider an illustrative upkeep calculation for agents serving in a campaign. Its complete local setup is:

| Element             | Modeling role       | Meaning in this example                                                     |
| ------------------- | ------------------- | --------------------------------------------------------------------------- |
| UpkeepRate          | Type                | Describes a nonnegative integer amount of money per serving agent per turn. |
| Standard upkeep     | GDR                 | Has Type UpkeepRate and value 2 money per serving agent per turn.           |
| Serving-agent count | Authoritative value | Value in Campaign state, currently 3.                                       |
| Upkeep calculation  | Rule                | Upkeep for one turn equals the rate multiplied by the serving-agent count.  |
| Total upkeep        | Derived value       | 2 × 3 = 6 money for this turn.                                              |

During "advance turn" computation, the engine reads the rate of 2 from the Standard upkeep GDR, which conforms to
Type UpkeepRate, and the serving-agent count of 3, an Authoritative value in Campaign state. The engine applies the
upkeep calculation Rule to these inputs, producing total upkeep of 6, a Derived value. The engine deducts 6 from the campaign's current money; the updated
money becomes part of the new Committed state, which is the result of turn advancement completion.

```mermaid
flowchart LR
    Type["Type: UpkeepRate"] -.->|describes| GDR["GDR: Standard upkeep · rate 2"]
    GDR -->|rate 2| Engine["Engine applies upkeep calculation Rule"]
    State["Campaign state"] -->|Authoritative value: serving-agent count 3| Engine
    Rule["Rule: rate × serving-agent count"] -->|specifies calculation| Engine
    Engine -->|calculates| Total["Derived value: total upkeep 6"]
    Total -->|amount to deduct| Update["Engine updates campaign money"]
    State -->|current money| Update
    Update -->|included when turn advancement completes| Committed["New Committed state"]
```

## GDR role: archetype

Consider an illustrative construction of two Enemy Campaign instances from the same Thug GDR:

| Element             | Modeling role                 | Meaning in this example                                                                                    |
| ------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Enemy               | Type                          | Describes the constructed Enemy Campaign instances.                                                        |
| EnemyArchetype      | Type                          | Describes the shared enemy characteristics and construction defaults.                                      |
| Thug                | GDR in the Archetype role     | Has Type EnemyArchetype and base health 10.                                                                |
| Enemy construction  | Campaign instance constructor | Specifies construction of an Enemy Campaign instance using the supplied Archetype and a fresh Instance ID. |
| enemy_1 and enemy_2 | Campaign instances            | Distinct Enemy Campaign instances sharing Thug as their Archetype, with independent State and Constants.   |
| Current health      | Authoritative value           | Initialized to 10 in each Enemy Campaign instance’s State.                                                 |

The engine passes the Thug GDR and a fresh Instance ID to the Enemy constructor implementation for each enemy.
The implementation returns an Enemy Campaign instance with Archetype set to Thug, current health initialized to 10
in State, and its Instance ID set to the supplied identifier. The caller adds each Enemy Campaign instance to its owning Mission.
Both Enemy Campaign instances refer to the same GDR; damaging enemy_1 changes its health without changing enemy_2 or Thug.

```mermaid
flowchart LR
    Thug["GDR: Thug · base health 10"] -->|Archetype input| Engine["Engine invokes Enemy constructor implementation twice"]
    IDs["Fresh Instance IDs:<br/>enemy_1 and enemy_2"] -->|identity inputs| Engine
    Constructor["Campaign instance constructor:<br/>Enemy construction"] -->|specifies construction| Engine
    Engine -->|constructs| Enemy1["Enemy Campaign instance enemy_1<br/>Archetype: Thug<br/>Instance ID: enemy_1<br/>Constants: empty<br/>State: health 10"]
    Engine -->|constructs| Enemy2["Enemy Campaign instance enemy_2<br/>Archetype: Thug<br/>Instance ID: enemy_2<br/>Constants: empty<br/>State: health 10"]
```

## GDR role: referenced GDR

In the Referenced GDR role, a GDR is referenced by a Campaign instance for a purpose other than supplying its Archetype.
Consider an illustrative Lead and an Investigation of that Lead. The complete comparison needed here is:

| Example concept        | Modeling role                                                                                                                                   | Question it answers                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Lead                   | GDR in the Referenced GDR role, representing a Lead to pursue.                                                                                  | Which Lead can be pursued?                                                        |
| Investigation          | Campaign instance for investigation of a given Lead, with its own Instance ID, progress in State, and an immutable Lead reference in Constants. | Which Investigation concerns that Lead, and how has it progressed?                |
| InvestigationArchetype | GDR used as an Investigation's Archetype, supplying shared characteristics and construction defaults independently of the referenced Lead.      | What shared characteristics and construction defaults does the Investigation use? |

Suppose Lead lead_1 is referenced by Investigation investigation_1, constructed with InvestigationArchetype investigation_archetype_1. Its Instance ID is investigation_1; its Constants contains the
immutable Lead reference, and its State contains lifecycle initialized to active and progress initialized to 0. The archetype remains the separate shared
component. Adding the Lead reference does not create a fifth property or make lead_1 the Investigation's archetype.

For this example, investigation_1 reaches progress 2 and is abandoned. A new Investigation investigation_2 at lead_1 starts at progress 0 with its own Instance ID.
Use archetype investigation_archetype_2 for investigation_2 to show that the Investigation's Lead reference and Archetype are independent relationships. These
are symbolic GDRs without selected production properties or mechanics. The example assumes both combinations are
permitted; it does not define eligibility or concurrency rules.

```mermaid
flowchart LR
    lead_1["Lead GDR: lead_1"]
    investigation_archetype_1["InvestigationArchetype investigation_archetype_1"]
    investigation_archetype_2["InvestigationArchetype investigation_archetype_2"]
    subgraph investigation_1["Investigation investigation_1"]
        investigation_1_archetype["Archetype: investigation_archetype_1"]
        investigation_1_identity["Instance ID: investigation_1"]
        investigation_1_constants["Constants: Lead lead_1"]
        investigation_1_state["State: abandoned, progress 2"]
    end
    subgraph investigation_2["Investigation investigation_2"]
        investigation_2_archetype["Archetype: investigation_archetype_2"]
        investigation_2_identity["Instance ID: investigation_2"]
        investigation_2_constants["Constants: Lead lead_1"]
        investigation_2_state["State: active, progress 0"]
    end
    investigation_1_archetype -->|resolves to| investigation_archetype_1
    investigation_2_archetype -->|resolves to| investigation_archetype_2
    investigation_1_constants -->|immutable reference| lead_1
    investigation_2_constants -->|immutable reference| lead_1
```

Both Investigations can share lead_1 without sharing progress. Retargeting investigation_1 to another Lead or replacing investigation_archetype_1 after construction
would violate its fixed facts. Using lead_1 as its archetype would fail the expected InvestigationArchetype reference,
regardless of whether some properties match.

## GDR role: key for campaign facts

In the Key for campaign facts role, a GDR’s identity associates campaign-specific facts with that GDR. The facts belong to Campaign state;
the GDR remains shared and immutable.

Continuing the illustrative Investigation example, suppose investigation_2 completes after investigation_1 was abandoned.
Campaign state retains both Investigation Campaign instances, including the values of the Lead reference property
within each Campaign instance’s Constants property and the lifecycle property within its State property.

| Element                                                                        | Modeling role                          | Meaning in this example                                                                                                                                   |
| ------------------------------------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lead_1                                                                         | GDR in the Key for campaign facts role | Its identity selects the Investigations concerning this Lead; the GDR remains unchanged.                                                                  |
| Properties of completed investigations that denote to which leads they pertain | Authoritative values                   | The Lead reference property within the Constants property of the Completed Investigation Campaign instance investigation_2 identifies lead_1.             |
| Completion count for lead_1                                                    | Derived value                          | Count Investigation Campaign instances whose Lead reference property identifies lead_1 and whose lifecycle property has value Completed. The result is 1. |

How to determine the Derived value of the completion count for the Lead GDR lead_1 from Authoritative values:

1. **Collect Investigations:** Start with all Investigation Campaign instances in the Campaign state.
2. **Filter by Lead reference:** For each Investigation Campaign instance, read the value of the Lead reference property within its Constants property. Keep only Campaign instances whose Lead reference identifies lead_1.
3. **Filter by Completed lifecycle:** For each remaining Investigation Campaign instance, read the value of the lifecycle property within its State property. Keep only Campaign instances whose lifecycle property has the value Completed.
4. **Count matching Investigations:** Count the remaining Investigation Campaign instances. The result is the Derived value of the completion count for lead_1. In this example, investigation_1 is excluded because its lifecycle property has the value Abandoned; investigation_2 is counted, so the result is 1.

The Lead reference and lifecycle property values read in steps 2 and 3 are Authoritative values. Caching the resulting
completion count does not change its classification as a Derived value.

```mermaid
flowchart LR
    Lead["Lead GDR: lead_1<br/>Shared immutable data"]
    subgraph CampaignState["Campaign state: Authoritative property values"]
        Investigation1["Investigation Campaign instance investigation_1<br/>Constants property: Lead reference property = lead_1<br/>State property: lifecycle property = Abandoned"]
        Investigation2["Investigation Campaign instance investigation_2<br/>Constants property: Lead reference property = lead_1<br/>State property: lifecycle property = Completed"]
    end
    Lead -->|GDR identity to match| SelectLead["Engine filters by Lead reference<br/>Both Investigations match lead_1"]
    Investigation1 -->|Lead reference and lifecycle values| SelectLead
    Investigation2 -->|Lead reference and lifecycle values| SelectLead
    SelectLead --> SelectCompleted["Engine filters by Completed lifecycle<br/>Only investigation_2 matches"]
    SelectCompleted --> Count["Engine counts matching Investigation Campaign instances"]
    Count --> Result["Derived value:<br/>Completion count for lead_1 = 1"]
```
