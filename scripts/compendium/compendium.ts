import GithubSlugger from 'github-slugger'
import { parseAllDocuments } from 'yaml'

import type { SourceFile } from '../spec-linter/types.ts'

/**
 * Reads the Game Data Records (GDRs) under `content/`, checks the Compendium articles among them as Compendium
 * article GDR validation and Compendium coverage state, and resolves each article into the text, inserted values, and
 * links that Article resolution in the Compendium specification defines.
 */

export const CONTENT_DIRECTORY = 'content'
/** The Cut content directory: GDRs removed from the Game build, which no check or tool loads. */
export const CUT_CONTENT_DIRECTORY = 'content/cut'
export const ARTICLE_TYPE = 'CompendiumArticle'
export const ARTICLE_DIRECTORY = 'content/compendium/compendium_articles'
export const COMPENDIUM_PREVIEW_PATH = 'docs/derived/compendium.md'

export interface Gdr {
  readonly id: string
  readonly type: string
  readonly path: string
  /** Every property of the GDR other than `id` and `type`, in authored order. */
  readonly properties: Readonly<Record<string, unknown>>
}

export interface GameData {
  readonly gdrs: ReadonlyMap<string, Gdr>
  readonly findings: readonly string[]
}

export type ArticleCategory = 'guide' | 'mechanics' | 'subject'

export interface FormulaRow {
  readonly label: string
  readonly text: string
}

export interface Article {
  readonly id: string
  readonly path: string
  readonly category: ArticleCategory
  /** The displayed title: the authored `title`, or the `name` of the subject of a subject article. */
  readonly title: string
  readonly body: string
  readonly subject: Gdr | undefined
  readonly formulas: readonly FormulaRow[]
  readonly terms: readonly string[]
  readonly seeAlso: readonly string[]
}

export type Segment =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'value'; readonly text: string }
  | { readonly kind: 'link'; readonly text: string; readonly target: string }

export interface ResolvedArticle {
  readonly article: Article
  readonly body: readonly Segment[]
  readonly formulas: readonly { readonly label: readonly Segment[]; readonly text: readonly Segment[] }[]
  readonly seeAlso: readonly { readonly target: string; readonly title: string }[]
}

interface PlaceholderSource {
  /** The properties a placeholder may name, or `every` for every property of the Type. */
  readonly properties: readonly string[] | 'every'
  /** Whether only the `{subject.property}` form may name a GDR of the Type. */
  readonly subjectOnly: boolean
}

/** The table under Placeholder sources in the Compendium specification; a test keeps the two equal. */
export const PLACEHOLDER_SOURCES: Readonly<Record<string, PlaceholderSource>> = {
  AgentArchetype: { properties: 'every', subjectOnly: false },
  AgentParameters: { properties: 'every', subjectOnly: false },
  RecoveryParameters: { properties: 'every', subjectOnly: false },
  EnemyArchetype: { properties: 'every', subjectOnly: false },
  Weapon: { properties: ['name', 'base_weapon_damage', 'price', 'ammo_type'], subjectOnly: false },
  Armor: { properties: ['name', 'base_armor', 'price'], subjectOnly: false },
  AmmoType: { properties: 'every', subjectOnly: false },
  EquipmentParameters: { properties: 'every', subjectOnly: false },
  CombatParameters: { properties: 'every', subjectOnly: false },
  EconomyParameters: { properties: 'every', subjectOnly: false },
  Upgrade: { properties: 'every', subjectOnly: false },
  InvestigationParameters: { properties: 'every', subjectOnly: false },
  EndingParameters: { properties: 'every', subjectOnly: false },
  FactionArchetype: { properties: ['name'], subjectOnly: true },
  Lead: { properties: ['name', 'description'], subjectOnly: true },
  MissionSiteArchetype: { properties: ['name', 'expires_in_turns'], subjectOnly: true },
}

/** The properties whose value is a reference to a GDR, which a placeholder replaces by that GDR's `name`. */
const REFERENCE_PROPERTIES: Readonly<Record<string, readonly string[]>> = {
  AgentArchetype: ['weapon', 'armor'],
  EnemyArchetype: ['weapon', 'armor'],
  Weapon: ['ammo_type'],
  EquipmentParameters: ['fallback_armor'],
  CombatParameters: ['fallback_weapon'],
}

const ARTICLE_PROPERTIES = [
  'category',
  'title',
  'body',
  'subject',
  'formulas',
  'terms',
  'see_also',
  'listed_under',
  'visible_when',
]
const CATEGORIES: readonly ArticleCategory[] = ['guide', 'mechanics', 'subject']

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

/** What is wrong with a `visible_when` Condition, which may use the Condition kind `lead_completed` only. */
function visibilityConditionFindings(condition: unknown, gameData: GameData): string[] {
  if (!isRecord(condition) || Object.keys(condition).length !== 1) {
    return ['visible_when is a Condition, i.e. a map with exactly one key.']
  }
  const [key, value] = Object.entries(condition)[0] ?? ['', undefined]
  if (key === 'all' || key === 'any') {
    if (!Array.isArray(value)) return [`visible_when: ${key} holds a list of Conditions.`]
    return value.flatMap((part: unknown) => visibilityConditionFindings(part, gameData))
  }
  if (key === 'not') return visibilityConditionFindings(value, gameData)
  if (key !== 'lead_completed')
    return [`visible_when uses the Condition kind "${key}"; only lead_completed is allowed.`]
  if (!isText(value) || gameData.gdrs.get(value)?.type !== 'Lead') {
    return [`visible_when: lead_completed names "${String(value)}", which is no Lead.`]
  }
  return []
}

/** Reads every GDR of the YAML files under `content/`. A file may hold several GDRs, one YAML document each. */
export function loadGameData(files: readonly SourceFile[]): GameData {
  const gdrs = new Map<string, Gdr>()
  const findings: string[] = []
  for (const file of files.toSorted((left, right) => compareText(left.path, right.path))) {
    const documents = parseAllDocuments(file.content)
    // A directory that holds one file per GDR lies one level below the directory of the Type owner.
    const perGdrFile = file.path.split('/').length === 4
    if (perGdrFile && documents.length !== 1) {
      findings.push(`${file.path}: a file in a directory of one file per GDR holds exactly one GDR.`)
    }
    for (const document of documents) {
      if (document.errors.length > 0) {
        findings.push(`${file.path}: ${document.errors.map((error) => error.message).join('; ')}`)
        continue
      }
      const value: unknown = document.toJS()
      if (!isRecord(value) || !isText(value['id']) || !isText(value['type'])) {
        findings.push(`${file.path}: every GDR is a mapping with a text id and a text type.`)
        continue
      }
      const { id, type, ...properties } = value
      if (gdrs.has(id)) {
        findings.push(`${file.path}: the GDR identifier "${id}" is already used in ${gdrs.get(id)?.path ?? ''}.`)
        continue
      }
      if (perGdrFile && !file.path.endsWith(`/${id}.yaml`)) {
        findings.push(`${file.path}: the file is named after its GDR, i.e. ${id}.yaml.`)
      }
      gdrs.set(id, { id, type, path: file.path, properties })
    }
  }
  return { gdrs, findings }
}

type TemplatePart =
  | { readonly kind: 'text'; readonly text: string }
  | {
      readonly kind: 'placeholder'
      readonly gdr: string
      readonly property: string
      readonly index: number | undefined
    }

const PLACEHOLDER = /^([^.{}\s]+)\.([^.{}\s]+)(?:\.([1-9][0-9]*))?$/

/** Splits templated text into authored text and placeholders; `{{` and `}}` stand for a literal brace. */
export function parseTemplate(text: string): readonly TemplatePart[] | string {
  const parts: TemplatePart[] = []
  let literal = ''
  let position = 0
  while (position < text.length) {
    const character = text[position]
    if ((character === '{' || character === '}') && text[position + 1] === character) {
      literal += character
      position += 2
    } else if (character === '}') {
      return `a "}" at character ${position + 1} closes no placeholder; write "}}" for a literal brace`
    } else if (character === '{') {
      const end = text.indexOf('}', position)
      const inner = end < 0 ? undefined : text.slice(position + 1, end)
      const match = inner === undefined ? null : PLACEHOLDER.exec(inner)
      if (!match) {
        return `"${text.slice(position, end < 0 ? undefined : end + 1)}" is not a placeholder of the form {gdr_id.property} or {gdr_id.property.N}`
      }
      if (literal) parts.push({ kind: 'text', text: literal })
      literal = ''
      parts.push({
        kind: 'placeholder',
        gdr: match[1] ?? '',
        property: match[2] ?? '',
        index: match[3] === undefined ? undefined : Number(match[3]),
      })
      position = (end < 0 ? text.length : end) + 1
    } else {
      literal += character
      position += 1
    }
  }
  if (literal) parts.push({ kind: 'text', text: literal })
  return parts
}

/** The text a placeholder shows for one value, under Value formatting, or undefined for a value it cannot show. */
export function formatValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const text = String(Math.abs(value))
  if (!/^[0-9]+(\.[0-9]+)?$/.test(text)) return undefined
  return value < 0 ? `−${text}` : text
}

interface PlaceholderResult {
  readonly text?: string
  readonly finding?: string
  /** The GDR and property the placeholder names, as `gdr_id.property`, when both exist. */
  readonly key?: string
}

function resolvePlaceholder(
  part: Extract<TemplatePart, { kind: 'placeholder' }>,
  subject: Gdr | undefined,
  gdrs: ReadonlyMap<string, Gdr>,
): PlaceholderResult {
  const written = `{${part.gdr}.${part.property}${part.index === undefined ? '' : `.${part.index}`}}`
  const ofSubject = part.gdr === 'subject'
  if (ofSubject && !subject) return { finding: `${written} is used in an article that has no subject` }
  const gdr = ofSubject ? subject : gdrs.get(part.gdr)
  if (!gdr) return { finding: `${written} names no GDR` }
  if (!(part.property in gdr.properties)) return { finding: `${written} names no property of ${gdr.id}` }
  const key = `${gdr.id}.${part.property}`
  const source = PLACEHOLDER_SOURCES[gdr.type]
  if (!source || (source.subjectOnly && !ofSubject)) {
    return {
      key,
      finding: `${written} names a GDR of Type ${gdr.type}, which ${source ? 'only {subject.property} may name' : 'no placeholder may name'}`,
    }
  }
  if (source.properties !== 'every' && !source.properties.includes(part.property)) {
    return { key, finding: `${written} names a property of ${gdr.type} that no placeholder may name` }
  }
  let value = gdr.properties[part.property]
  if (Array.isArray(value)) {
    if (part.index === undefined) return { key, finding: `${written} names a list and needs an index` }
    const list: readonly unknown[] = value
    if (part.index > list.length) return { key, finding: `${written} has an index beyond the ${list.length} entries` }
    value = list[part.index - 1]
  } else if (part.index !== undefined) {
    return { key, finding: `${written} has an index, but the value is not a list` }
  }
  if (REFERENCE_PROPERTIES[gdr.type]?.includes(part.property)) {
    const referenced = typeof value === 'string' ? gdrs.get(value) : undefined
    const name = referenced?.properties['name']
    if (!isText(name)) return { key, finding: `${written} references no GDR that has a name` }
    return { key, text: name }
  }
  const text = formatValue(value)
  if (text === undefined) return { key, finding: `${written} names a value that is neither a number nor text` }
  return { key, text }
}

export interface Compendium {
  readonly articles: readonly Article[]
  readonly findings: readonly string[]
  /** Every `gdr_id.property` that a placeholder of some article names. */
  readonly placeholderKeys: ReadonlySet<string>
}

function textList(value: unknown): readonly string[] | undefined {
  if (value === undefined) return []
  if (!Array.isArray(value)) return undefined
  const items: readonly unknown[] = value
  return items.every(isText) ? items : undefined
}

function formulaRows(value: unknown): readonly FormulaRow[] | undefined {
  if (!Array.isArray(value)) return undefined
  const items: readonly unknown[] = value
  const rows: FormulaRow[] = []
  for (const item of items) {
    if (!isRecord(item) || Object.keys(item).length !== 2) return undefined
    const { label, text } = item
    if (!isText(label) || !isText(text)) return undefined
    rows.push({ label, text })
  }
  return rows.length > 0 ? rows : undefined
}

/** Reads the Compendium articles of the game data and applies every rule of Compendium article GDR validation. */
export function loadCompendium(gameData: GameData): Compendium {
  const findings: string[] = []
  const articles: Article[] = []
  const placeholderKeys = new Set<string>()
  for (const gdr of gameData.gdrs.values()) {
    if (gdr.type !== ARTICLE_TYPE) continue
    const report = (message: string): number => findings.push(`${gdr.path}: ${message}`)
    if (gdr.path !== `${ARTICLE_DIRECTORY}/${gdr.id}.yaml`) {
      report(`a Compendium article lies in ${ARTICLE_DIRECTORY}/, in a file named after it.`)
    }
    const { category, title, body, subject, formulas, terms, see_also: seeAlso } = gdr.properties
    const unknown = Object.keys(gdr.properties).filter((property) => !ARTICLE_PROPERTIES.includes(property))
    if (unknown.length > 0) report(`unknown properties: ${unknown.join(', ')}.`)
    const visibleWhen = gdr.properties['visible_when']
    if (visibleWhen !== undefined) {
      for (const finding of visibilityConditionFindings(visibleWhen, gameData)) report(finding)
    }
    const articleCategory = CATEGORIES.find((candidate) => candidate === category)
    if (!articleCategory) {
      report('category is guide, mechanics, or subject.')
      continue
    }
    if (!isText(body)) {
      report('body is non-empty text.')
      continue
    }
    let subjectGdr: Gdr | undefined
    let displayedTitle: string | undefined
    if (articleCategory === 'subject') {
      if (title !== undefined) report('a subject article has no title; it shows the name of its subject.')
      subjectGdr = typeof subject === 'string' ? gameData.gdrs.get(subject) : undefined
      const name = subjectGdr?.properties['name']
      if (!subjectGdr || subjectGdr.type === ARTICLE_TYPE || !isText(name)) {
        report('subject identifies a GDR that is not a Compendium article and has a non-empty name.')
        continue
      }
      displayedTitle = name
    } else {
      if (subject !== undefined) report(`a ${articleCategory} article has no subject.`)
      if (!isText(title)) {
        report('title is non-empty text.')
        continue
      }
      displayedTitle = title
    }
    let rows: readonly FormulaRow[] = []
    if (articleCategory === 'mechanics') {
      const parsed = formulaRows(formulas)
      if (!parsed) report('formulas is a list of one or more rows, each a non-empty label and a non-empty text.')
      rows = parsed ?? []
    } else if (formulas !== undefined) {
      report(`a ${articleCategory} article has no formulas.`)
    }
    const termList = textList(terms)
    if (!termList) report('terms is a list of non-empty texts.')
    for (const term of termList ?? []) {
      if (term !== term.trim() || /[{}]/.test(term)) {
        report(`the term "${term}" has surrounding spaces or a brace.`)
      }
    }
    const seeAlsoList = textList(seeAlso)
    if (!seeAlsoList) report('see_also is a list of article identifiers.')
    articles.push({
      id: gdr.id,
      path: gdr.path,
      category: articleCategory,
      title: displayedTitle,
      body,
      subject: subjectGdr,
      formulas: rows,
      terms: termList ?? [],
      seeAlso: seeAlsoList ?? [],
    })
  }

  const byId = new Map(articles.map((article) => [article.id, article]))
  const titles = new Map<string, Article>()
  const subjects = new Map<string, Article>()
  const termOwners = new Map<string, Article>()
  // COMP, CompendiumArticle: `listed_under` names a Type that the subject of some Subject article has, and only a
  // guide or mechanics article has it.
  const subjectTypes = new Set(articles.flatMap((article) => (article.subject ? [article.subject.type] : [])))
  for (const gdr of gameData.gdrs.values()) {
    if (gdr.type !== ARTICLE_TYPE) continue
    const listedUnder = gdr.properties['listed_under']
    if (listedUnder === undefined) continue
    if (gdr.properties['category'] === 'subject') {
      findings.push(`${gdr.path}: a subject article has no listed_under.`)
    } else if (typeof listedUnder !== 'string' || !subjectTypes.has(listedUnder)) {
      findings.push(`${gdr.path}: listed_under names a Type that the subject of some subject article has.`)
    }
  }
  for (const article of articles) {
    const report = (message: string): number => findings.push(`${article.path}: ${message}`)
    const titleKey = article.title.toLowerCase()
    const sameTitle = titles.get(titleKey)
    if (sameTitle) report(`the displayed title "${article.title}" is also that of ${sameTitle.id}.`)
    else titles.set(titleKey, article)
    if (article.subject) {
      const sameSubject = subjects.get(article.subject.id)
      if (sameSubject) report(`the subject ${article.subject.id} already has the article ${sameSubject.id}.`)
      else subjects.set(article.subject.id, article)
    }
    for (const term of article.terms) {
      const owner = termOwners.get(term.toLowerCase())
      if (owner) report(`the term "${term}" is also a term of ${owner.id}.`)
      else termOwners.set(term.toLowerCase(), article)
    }
    for (const [index, target] of article.seeAlso.entries()) {
      if (target === article.id) report('see_also names the article itself.')
      else if (!byId.has(target)) report(`see_also names "${target}", which is no Compendium article.`)
      if (article.seeAlso.indexOf(target) !== index) report(`see_also names "${target}" more than once.`)
    }
    for (const text of templatedTexts(article)) {
      const parts = parseTemplate(text)
      if (typeof parts === 'string') {
        report(`${parts}.`)
        continue
      }
      for (const part of parts) {
        if (part.kind !== 'placeholder') continue
        const result = resolvePlaceholder(part, article.subject, gameData.gdrs)
        if (result.key !== undefined) placeholderKeys.add(result.key)
        if (result.finding !== undefined) report(`${result.finding}.`)
      }
    }
  }
  return { articles, findings: [...gameData.findings, ...findings], placeholderKeys }
}

/** The templated texts of an article in scan order: the body, then each formula row's label and text. */
function templatedTexts(article: Article): readonly string[] {
  return [article.body, ...article.formulas.flatMap((row) => [row.label, row.text])]
}

/** The rows of the exemption table under Compendium coverage in GDRs, each as `gdr_id.property`. */
export function coverageExemptions(gdrs: string): readonly string[] {
  const section = gdrs.split(/^# Compendium coverage$/m)[1]?.split(/^# /m)[0] ?? ''
  return [...section.matchAll(/^\| `([^`]+)`\s*\| `([^`]+)`\s*\|/gm)].map((match) => `${match[1]}.${match[2]}`)
}

/** Whether a GDR is a parameter GDR, i.e. its Type name ends in "Parameters". */
export function isParameterGdr(gdr: Gdr): boolean {
  return gdr.type.endsWith('Parameters')
}

/** The findings of Compendium coverage: every property of every parameter GDR that no placeholder names. */
export function coverageFindings(
  gameData: GameData,
  compendium: Compendium,
  exemptions: readonly string[],
): readonly string[] {
  const findings: string[] = []
  const exempt = new Set(exemptions)
  const existing = new Set<string>()
  for (const gdr of gameData.gdrs.values()) {
    if (!isParameterGdr(gdr)) continue
    for (const property of Object.keys(gdr.properties)) {
      const key = `${gdr.id}.${property}`
      existing.add(key)
      if (exempt.has(key)) {
        if (compendium.placeholderKeys.has(key)) {
          findings.push(`${gdr.path}: ${key} is exempt from Compendium coverage, but an article names it.`)
        }
      } else if (!compendium.placeholderKeys.has(key)) {
        findings.push(
          `${gdr.path}: no Compendium article names ${key} in a placeholder; explain it in an article of category mechanics, or add it to the exemptions under Compendium coverage in GDRs.`,
        )
      }
    }
  }
  for (const key of exemptions) {
    if (!existing.has(key)) findings.push(`Compendium coverage exempts ${key}, which no parameter GDR has.`)
  }
  return findings
}

const WORD_CHARACTER = /[\p{L}\p{N}]/u

function isWordCharacter(character: string | undefined): boolean {
  return character !== undefined && WORD_CHARACTER.test(character)
}

/**
 * Resolves the articles in `visible`, under Article resolution: placeholders become inserted values, and in each
 * article the first occurrence of a term of each other visible article becomes a link.
 */
export function resolveArticles(
  visible: readonly Article[],
  gdrs: ReadonlyMap<string, Gdr>,
): readonly ResolvedArticle[] {
  const terms = visible
    .flatMap((article) => article.terms.map((term) => ({ text: term.toLowerCase(), article })))
    // Longest first, so that the first term found at a position is the longest one there.
    .toSorted((left, right) => right.text.length - left.text.length)
  const byId = new Map(visible.map((article) => [article.id, article]))

  return visible.map((article) => {
    const linked = new Set<string>()
    const linkRun = (run: string): Segment[] => {
      const segments: Segment[] = []
      const lower = run.toLowerCase()
      let plain = ''
      let position = 0
      while (position < run.length) {
        const match = isWordCharacter(run[position - 1])
          ? undefined
          : terms.find(
              (term) => lower.startsWith(term.text, position) && !isWordCharacter(run[position + term.text.length]),
            )
        if (!match) {
          plain += run[position]
          position += 1
          continue
        }
        const text = run.slice(position, position + match.text.length)
        position += text.length
        if (match.article.id === article.id || linked.has(match.article.id)) {
          plain += text
          continue
        }
        if (plain) segments.push({ kind: 'text', text: plain })
        plain = ''
        linked.add(match.article.id)
        segments.push({ kind: 'link', text, target: match.article.id })
      }
      if (plain) segments.push({ kind: 'text', text: plain })
      return segments
    }
    const resolve = (text: string): readonly Segment[] => {
      const parts = parseTemplate(text)
      if (typeof parts === 'string') throw new Error(`${article.path}: ${parts}.`)
      return parts.flatMap((part): Segment[] => {
        if (part.kind === 'text') return linkRun(part.text)
        const result = resolvePlaceholder(part, article.subject, gdrs)
        if (result.text === undefined || result.finding !== undefined) {
          throw new Error(`${article.path}: ${result.finding ?? 'a placeholder has no value'}.`)
        }
        return [{ kind: 'value', text: result.text }]
      })
    }
    // The scan order is the body, then each formula row in order, its label before its text.
    const body = resolve(article.body)
    const formulas = article.formulas.map((row) => ({ label: resolve(row.label), text: resolve(row.text) }))
    const seeAlso = article.seeAlso.flatMap((target) => {
      const targetArticle = byId.get(target)
      return targetArticle ? [{ target, title: targetArticle.title }] : []
    })
    return { article, body, formulas, seeAlso }
  })
}

function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_[\]<>|])/g, '\\$1')
}

function escapeCell(text: string): string {
  return escapeMarkdown(text).replace(/\r?\n/g, ' ')
}

const GROUP_TITLES: Readonly<Record<Exclude<ArticleCategory, 'subject'>, string>> = {
  guide: 'Guide articles',
  mechanics: 'Mechanics articles',
}

interface PreviewGroup {
  readonly title: string
  readonly articles: readonly ResolvedArticle[]
}

function previewGroups(resolved: readonly ResolvedArticle[]): readonly PreviewGroup[] {
  const byTitle = (left: ResolvedArticle, right: ResolvedArticle): number =>
    compareText(left.article.title.toLowerCase(), right.article.title.toLowerCase())
  const groups: PreviewGroup[] = []
  for (const category of ['guide', 'mechanics'] as const) {
    const articles = resolved.filter((item) => item.article.category === category).toSorted(byTitle)
    if (articles.length > 0) groups.push({ title: GROUP_TITLES[category], articles })
  }
  const types = [...new Set(resolved.flatMap((item) => (item.article.subject ? [item.article.subject.type] : [])))]
  for (const type of types.toSorted(compareText)) {
    const articles = resolved.filter((item) => item.article.subject?.type === type).toSorted(byTitle)
    groups.push({ title: `Subject articles: ${type}`, articles })
  }
  return groups
}

/** A table cell that shows a GDR value as authored, as code. */
function rawValueCell(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return `\`${text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|')}\``
}

/**
 * Renders the Compendium preview: every article, grouped by category, with every placeholder replaced by its value,
 * every term link as a link within the page, and the path of its source file.
 */
export function renderCompendiumPreview(compendium: Compendium, gdrs: ReadonlyMap<string, Gdr>): string {
  const groups = previewGroups(resolveArticles(compendium.articles, gdrs))
  const slugger = new GithubSlugger()
  slugger.slug('Compendium Preview')
  const anchors = new Map<string, string>()
  for (const group of groups) {
    slugger.slug(group.title)
    for (const item of group.articles) anchors.set(item.article.id, slugger.slug(item.article.title))
  }
  const link = (text: string, target: string): string => `[${escapeMarkdown(text)}](#${anchors.get(target) ?? ''})`
  const render = (segments: readonly Segment[], escape: (text: string) => string): string =>
    segments
      .map((segment) => (segment.kind === 'link' ? link(segment.text, segment.target) : escape(segment.text)))
      .join('')

  const lines = [
    '# Compendium Preview',
    '',
    '> **Generated — do not edit.** Run `npm run docs:generate` after changing a file under `content/`.',
    '',
    'Every Compendium article of the game data, as the game shows it when every article is Player-visible: each Placeholder is replaced by the value of the GDR property it names, and the first mention of an Article term of another article is an Article link to that article. Each article is edited in its source file. A Subject article is followed here by the properties of its subject as authored; the Data sheet that the game shows in their place is specified in Compendium View.',
    '',
    '[Back to the derived specification catalog](README.md)',
  ]
  for (const group of groups) {
    lines.push('', `## ${group.title}`)
    for (const item of group.articles) {
      const { article } = item
      lines.push('', `### ${escapeMarkdown(article.title)}`, '', `Source: \`${article.path}\``, '')
      lines.push(render(item.body, escapeMarkdown))
      if (item.formulas.length > 0) {
        lines.push('', '| Formulas |  |', '| --- | --- |')
        for (const row of item.formulas) {
          lines.push(`| ${render(row.label, escapeCell)} | ${render(row.text, escapeCell)} |`)
        }
      }
      if (article.subject) {
        lines.push('', `| \`${article.subject.id}\` | ${article.subject.type} |`, '| --- | --- |')
        for (const [property, value] of Object.entries(article.subject.properties)) {
          lines.push(`| \`${property}\` | ${rawValueCell(value)} |`)
        }
      }
      if (item.seeAlso.length > 0) {
        lines.push('', `See also: ${item.seeAlso.map((entry) => link(entry.title, entry.target)).join(' · ')}`)
      }
    }
  }
  return `${lines.join('\n')}\n`
}
