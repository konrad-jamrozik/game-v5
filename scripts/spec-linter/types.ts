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

export type SpecificationFamily = 'Governance' | 'Foundation' | 'Mechanics' | 'Content' | 'Interfaces' | 'Acceptance'

export type SpecificationStatus = 'Stub' | 'Draft' | 'Accepted' | 'Superseded'

export type RelationshipKind = 'follows' | 'refines' | 'uses' | 'implements' | 'verifies'

export interface SpecificationRecord {
  readonly id: string
  readonly family: SpecificationFamily
  readonly title: string
  readonly status: SpecificationStatus
  readonly scope: string
  readonly owns: string
  readonly path: string
}

export interface GlossaryRecord {
  readonly term: string
  readonly definitionMarkdown: string
  readonly ownerId: string
  readonly ownerPath: string
  readonly ownerStatus: SpecificationStatus
}

export interface RelationshipRecord {
  readonly dependencyId: string
  readonly dependencyPath: string
  readonly dependentId: string
  readonly dependentPath: string
  readonly kind: RelationshipKind
  readonly scope: string
  readonly origin: 'explicit' | 'implicit'
  readonly sourcePaths: readonly string[]
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
