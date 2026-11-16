export interface SourceFile {
  readonly path: string
  readonly content: string
}

export interface Diagnostic {
  readonly code: string
  readonly path: string
  readonly line: number
  readonly column: number
  readonly message: string
}

export interface LintInput {
  readonly files: readonly SourceFile[]
  readonly specificationRoot?: string
  readonly indexPath?: string
}

export type SpecificationKind = 'Governance' | 'Design' | 'Implementation'

export type SpecificationFamily =
  | 'Conventions'
  | 'Process'
  | 'Foundation'
  | 'Mechanics'
  | 'Content'
  | 'UI'
  | 'Autopilot AIs'
  | 'Mandatory'
  | 'Guidance'
  | 'Recipes'

/** The one relationship between specifications: a specification references every specification its text links. */
export type RelationshipKind = 'references'

export interface SpecificationRecord {
  readonly id: string
  readonly family: SpecificationFamily
  readonly title: string
  readonly owns: string
  readonly path: string
}

export interface GlossaryRecord {
  readonly term: string
  readonly definitionMarkdown: string
  /** The Prohibited synonyms cell of the term's row, or an empty string when the row records none. */
  readonly prohibitedSynonymsMarkdown: string
  readonly ownerId: string
  readonly ownerPath: string
}

export interface RelationshipRecord {
  readonly dependencyId: string
  readonly dependencyPath: string
  readonly dependentId: string
  readonly dependentPath: string
  readonly kind: RelationshipKind
}

export interface SpecificationCorpus {
  readonly specifications: readonly SpecificationRecord[]
  readonly glossary: readonly GlossaryRecord[]
  readonly relationships: readonly RelationshipRecord[]
}

export interface SpecificationAnalysis {
  readonly diagnostics: readonly Diagnostic[]
  readonly corpus: SpecificationCorpus
}
