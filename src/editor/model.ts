export const pageSizes = {
  A5: { width: 148, height: 210 },
  A4: { width: 210, height: 297 },
  HALF: { width: 139.7, height: 215.9 },
  LETTER: { width: 215.9, height: 279.4 },
} as const

export type PageName = keyof typeof pageSizes

export const pageNames: PageName[] = ['A5', 'A4', 'HALF', 'LETTER']

export type Tool = 'select' | 'box' | 'field' | 'value' | 'tracker' | 'table' | 'text' | 'rule'

export type Fill = 'none' | 'dots' | 'squares' | 'hex' | 'lines'

export type ElementType = SheetElement['type']

interface Bounds {
  id: string
  groupId?: string
  inset?: number
  padding?: number
  x: number
  y: number
  w: number
  h: number
}

export interface BoxElement extends Bounds {
  type: 'box'
  title: string
  fill: Fill
  gridSize: number
  cut: number
  caption?: 'top' | 'bottom'
  treatment?: 'frame' | 'backplate' | 'strip' | 'panel'
  hint?: string
}

export interface FieldElement extends Bounds {
  type: 'field'
  label: string
  labels?: string[]
  variant?: 'line' | 'box' | 'circle' | 'shield' | 'banner' | 'attached'
}

export interface TextElement extends Bounds {
  type: 'text'
  text: string
  size: number
  weight: 'normal' | 'bold'
  align: 'start' | 'middle' | 'end'
  color: string
}

export interface RuleElement extends Bounds {
  type: 'rule'
}

export interface TrackerElement extends Bounds {
  type: 'tracker'
  label: string
  count: number
  columns: number
  marker: 'circle' | 'square'
}

// 'number' prints 1..n, 'check' prints a tick box and 'letters' prints a short set of letters to circle by hand.
export type TableColumnKind = 'text' | 'number' | 'check' | 'letters'

export interface TableColumn {
  w?: number
  kind?: TableColumnKind
  letters?: string
}

export interface TableElement extends Bounds {
  type: 'table'
  title: string
  rows: number
  headers: string[]
  treatment?: 'frame' | 'panel'
  hint?: string
  // Parallel to headers; omitted columns are equal-width text.
  cols?: TableColumn[]
  // Ruled writing lines inside each row, so one row can hold a multi-line entry.
  lines?: number
  // First number printed by a 'number' column, so split tables can continue a count.
  start?: number
}

export type SheetElement = BoxElement | FieldElement | TextElement | RuleElement | TrackerElement | TableElement

export interface SheetDocument {
  page: PageName
  margins: { t: number; r: number; b: number; l: number }
  grid: number
  snap: boolean
  showGrid: boolean
  els: SheetElement[]
}

export const blankDocument: SheetDocument = {
  page: 'A5',
  margins: { t: 9, r: 10, b: 9, l: 10 },
  grid: 16 / 3,
  snap: true,
  showGrid: true,
  els: [],
}

export function round(value: number, document: SheetDocument, free = false) {
  if (document.snap && !free) return Math.round(value / document.grid) * document.grid

  return Math.round(value * 100) / 100
}

export function roundPosition(value: number, document: SheetDocument, axis: 'x' | 'y', free = false) {
  if (!document.snap || free) return round(value, document, free)

  const origin = axis === 'x' ? document.margins.l : document.margins.t

  return origin + round(value - origin, document, free)
}

export function makeId() {
  return Math.random().toString(36).slice(2, 9).padEnd(7, '0')
}

export function makeElement(
  type: Exclude<Tool, 'select'>,
  x: number,
  y: number,
  w: number,
  h: number,
): SheetElement {
  const bounds = { id: makeId(), x, y, w, h }

  if (type === 'box') {
    return { ...bounds, type, title: 'SECTION', fill: 'none', gridSize: 5, cut: 2 }
  }

  if (type === 'field' || type === 'value') return { ...bounds, type: 'field', label: type === 'value' ? 'VALUE' : 'LABEL', variant: type === 'value' ? 'box' : 'line' }

  if (type === 'rule') return { ...bounds, type }

  if (type === 'tracker') return { ...bounds, type, label: 'USES', count: 6, columns: 6, marker: 'circle' }

  if (type === 'table') return { ...bounds, type, title: 'TABLE', rows: 5, headers: ['NAME', 'VALUE', 'NOTES'] }

  return {
    ...bounds,
    type,
    text: 'TEXT',
    size: 2.699,
    weight: 'normal',
    align: 'start',
    color: '#111111',
  }
}

function gridBox(title: string, column: number, row: number, columns: number, rows: number, fill: Fill = 'none') {
  const element = makeElement(
    'box',
    blankDocument.margins.l + column * blankDocument.grid,
    blankDocument.margins.t + row * blankDocument.grid,
    columns * blankDocument.grid,
    rows * blankDocument.grid,
  )

  if (element.type === 'box') {
    element.title = title
    element.fill = fill
  }

  return element
}

function gridField(label: string, column: number, row: number, columns: number) {
  const element = makeElement(
    'field',
    blankDocument.margins.l + column * blankDocument.grid,
    blankDocument.margins.t + row * blankDocument.grid,
    columns * blankDocument.grid,
    blankDocument.grid,
  )

  if (element.type === 'field') element.label = label

  return element
}

function gridValue(label: string, column: number, row: number, columns: number, rows = 3) {
  const element = makeElement(
    'value',
    blankDocument.margins.l + column * blankDocument.grid,
    blankDocument.margins.t + row * blankDocument.grid,
    columns * blankDocument.grid,
    rows * blankDocument.grid,
  )

  if (element.type === 'field') element.label = label

  return element
}

function gridTracker(label: string, column: number, row: number, columns: number, rows: number, count: number) {
  const element = makeElement(
    'tracker',
    blankDocument.margins.l + column * blankDocument.grid,
    blankDocument.margins.t + row * blankDocument.grid,
    columns * blankDocument.grid,
    rows * blankDocument.grid,
  )

  if (element.type === 'tracker') {
    element.label = label
    element.count = count
    element.columns = count
  }

  return element
}

function gridTable(title: string, column: number, row: number, columns: number, rows: number, headers: string[], bodyRows: number) {
  const element = makeElement(
    'table',
    blankDocument.margins.l + column * blankDocument.grid,
    blankDocument.margins.t + row * blankDocument.grid,
    columns * blankDocument.grid,
    rows * blankDocument.grid,
  )

  if (element.type === 'table') {
    element.title = title
    element.headers = headers
    element.rows = bodyRows
  }

  return element
}

function dmHeader(title: string, labels: readonly string[]) {
  const columnsPerRow = Math.ceil(labels.length / 2)
  const width = 24 / columnsPerRow

  return [
    gridBox(title, 0, 0, 24, 6),
    ...labels.flatMap((label, index) => [
      gridField(label, (index % columnsPerRow) * width + 1, index < columnsPerRow ? 1 : 3, width - 2),
    ]),
  ]
}

function twoColumnSections(titles: readonly string[]) {
  return titles.map((title, index) => {
    const column = index % 2 === 0 ? 0 : 13
    const row = 7 + Math.floor(index / 2) * 10

    return gridBox(title, column, row, 11, 9, 'lines')
  })
}

export function locationDocument(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...dmHeader('LOCATION', ['NAME', 'ALIAS', 'TYPE', 'FACTION', 'AREA', 'STATUS']),
      ...twoColumnSections(['APPEARANCE & FEATURES', 'QUESTS', 'CONNECTED LOCATIONS', 'CHARACTERS & ENCOUNTERS', 'HISTORY & LEGENDS', 'NOTES']),
    ],
  }
}

export function npcDocument(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...dmHeader('NPC', ['NAME', 'ALIAS', 'ROLE', 'FACTION', 'HOME', 'STATUS']),
      ...twoColumnSections(['APPEARANCE & PERSONALITY', 'GOALS & QUESTS', 'IDENTITY, INSTINCTS & IDEAL', 'RELATIONS & ATTITUDE', 'SKILLS, STRENGTHS & WEAKNESSES', 'NOTES']),
    ],
  }
}

export function sessionDocument(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...dmHeader('SESSION LOG', ['TITLE', 'DATE', 'DM', 'PLAYERS']),
      gridBox('STORY DEVELOPMENTS', 0, 7, 15, 18, 'lines'),
      gridTable('ACTIVITY LOG', 16, 7, 8, 18, ['SCENE', 'EVENT'], 8),
      gridBox('LOCATIONS & NPCS', 0, 26, 11, 10, 'lines'),
      gridBox('NOTES & NEXT SESSION', 13, 26, 11, 10, 'lines'),
    ],
  }
}

export function partyDocument(): SheetDocument {
  const elements: SheetElement[] = [...dmHeader('PARTY TRACKER', ['CAMPAIGN', 'SETTING', 'DM', 'PLAYERS'])]

  for (let member = 0; member < 5; member += 1) {
    const row = 7 + member * 6

    elements.push(
      gridBox(`CHARACTER ${member + 1}`, 0, row, 24, 5),
      gridField('NAME', 1, row + 1, 8),
      gridValue('AC', 10, row + 1, 3, 3),
      gridValue('MAX HP', 14, row + 1, 4, 3),
      gridValue('PASSIVE', 19, row + 1, 4, 3),
      gridField('NOTES / SPECIAL ITEMS', 1, row + 3, 8),
    )
  }

  return { ...structuredClone(blankDocument), els: elements }
}

export function characterDocument(): SheetDocument {
  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((label, index) => gridValue(label, index * 4, 7, 4, 4))

  return {
    ...structuredClone(blankDocument),
    els: [
      ...dmHeader('CHARACTER', ['NAME', 'CLASS & LEVEL', 'PLAYER', 'ANCESTRY', 'BACKGROUND', 'ALIGNMENT']),
      ...abilities,
      gridValue('ARMOR CLASS', 0, 12, 4, 4),
      gridValue('INITIATIVE', 4, 12, 4, 4),
      gridValue('SPEED', 8, 12, 4, 4),
      gridValue('MAX HP', 12, 12, 5, 4),
      gridTracker('SUCCESSES', 18, 12, 6, 2, 3),
      gridTracker('FAILURES', 18, 14, 6, 2, 3),
      gridTable('SKILLS & SAVES', 0, 17, 8, 19, ['SKILL', 'BONUS'], 14),
      gridTable('ATTACKS & SPELLS', 9, 17, 8, 11, ['NAME', 'ROLL', 'EFFECT'], 6),
      gridBox('FEATURES & TRAITS', 18, 17, 6, 11, 'lines'),
      gridTracker('RESOURCES', 9, 29, 8, 3, 6),
      gridBox('NOTES', 9, 33, 15, 3, 'lines'),
    ],
  }
}

export type MarginSide = keyof SheetDocument['margins']

// Moves one margin. With `shift`, content follows the top or left margin so it keeps its distance from that edge.
export function setMargin(document: SheetDocument, side: MarginSide, value: number, shift: boolean): SheetDocument {
  const next = Math.max(0, Math.round(value * 100) / 100)
  const delta = next - document.margins[side]
  const follows = shift && (side === 'l' || side === 't')

  return {
    ...document,
    margins: { ...document.margins, [side]: next },
    els: follows ? document.els.map((element) => side === 'l' ? { ...element, x: element.x + delta } : { ...element, y: element.y + delta }) : document.els,
  }
}

export function chamferPath(x: number, y: number, w: number, h: number, cut: number) {
  const c = Math.min(cut, w / 2, h / 2)

  return `M ${x + c},${y} H ${x + w - c} L ${x + w},${y + c} V ${y + h - c} L ${x + w - c},${y + h} H ${x + c} L ${x},${y + h - c} V ${y + c} Z`
}
