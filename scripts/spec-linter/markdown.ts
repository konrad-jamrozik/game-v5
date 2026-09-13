import type { Heading, Link, Root, RootContent, Table, TableCell } from 'mdast'
import type { Node, Parent } from 'unist'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'

import type { SourceFile } from './types.ts'

export interface ParsedDocument extends SourceFile {
  readonly tree: Root
  readonly children: readonly RootContent[]
  readonly headings: readonly Heading[]
}

export function parseDocument(file: SourceFile): ParsedDocument {
  const tree = remark().use(remarkGfm).parse(file.content)
  return {
    ...file,
    tree,
    children: tree.children,
    headings: tree.children.filter(isHeading),
  }
}

export function isHeading(node: Node): node is Heading {
  return node.type === 'heading'
}

export function isTable(node: Node): node is Table {
  return node.type === 'table'
}

export function isLink(node: Node): node is Link {
  return node.type === 'link'
}

export function isParent(node: Node): node is Parent {
  return 'children' in node && Array.isArray(node.children)
}

export function textOf(node: Node): string {
  if ('value' in node && typeof node.value === 'string') {
    return node.value
  }
  if (!isParent(node)) return ''
  return node.children.map(textOf).join('')
}

export function visit(node: Node, visitor: (node: Node) => void): void {
  visitor(node)
  if (!isParent(node)) return
  for (const child of node.children) visit(child, visitor)
}

export function descendants(node: Node): readonly Node[] {
  const nodes: Node[] = []
  visit(node, (descendant) => {
    if (descendant !== node) nodes.push(descendant)
  })
  return nodes
}

export function linksIn(node: Node): readonly Link[] {
  return descendants(node).filter(isLink)
}

export function firstLink(node: Node): Link | undefined {
  if (isLink(node)) return node
  return linksIn(node)[0]
}

export function lineOf(node: Node | undefined): number {
  return node?.position?.start.line ?? 1
}

export function columnOf(node: Node | undefined): number {
  return node?.position?.start.column ?? 1
}

export function headingText(heading: Heading): string {
  return textOf(heading).trim()
}

export function findHeading(document: ParsedDocument, depth: number, text: string): Heading | undefined {
  return document.headings.find((heading) => heading.depth === depth && headingText(heading) === text)
}

export function directChildIndex(document: ParsedDocument, node: RootContent): number {
  return document.children.indexOf(node)
}

export function sectionNodes(document: ParsedDocument, heading: Heading): readonly RootContent[] {
  const start = directChildIndex(document, heading)
  if (start < 0) return []
  let end = document.children.length
  for (let index = start + 1; index < document.children.length; index += 1) {
    const child = document.children[index]
    if (child && isHeading(child) && child.depth <= heading.depth) {
      end = index
      break
    }
  }
  return document.children.slice(start + 1, end)
}

export function tablesIn(nodes: readonly RootContent[]): readonly Table[] {
  const tables: Table[] = []
  for (const node of nodes) {
    if (isTable(node)) tables.push(node)
    visit(node, (descendant) => {
      if (descendant !== node && isTable(descendant)) tables.push(descendant)
    })
  }
  return tables
}

export function tableRows(table: Table): readonly (readonly TableCell[])[] {
  return table.children.map((row) => row.children)
}

export function tableText(table: Table): readonly (readonly string[])[] {
  return tableRows(table).map((row) => row.map((cell) => textOf(cell).replace(/\s+/g, ' ').trim()))
}

export function topLevelHeadings(document: ParsedDocument): readonly Heading[] {
  return document.headings.filter((heading) => heading.depth === 1)
}

export function headingAtLine(document: ParsedDocument, line: number, depth: number): Heading | undefined {
  let current: Heading | undefined
  for (const heading of document.headings) {
    if (heading.depth !== depth) continue
    if (lineOf(heading) > line) break
    current = heading
  }
  return current
}
