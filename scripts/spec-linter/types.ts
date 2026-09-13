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
