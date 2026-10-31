import {
  blankDocument,
  characterDocument,
  locationDocument,
  makeElement,
  npcDocument,
  partyDocument,
  sessionDocument,
  type Fill,
  type SheetDocument,
  type SheetElement,
  type TableColumn,
} from './model'

const { grid, margins } = blankDocument

const gap = .5

const x = (column: number) => margins.l + column * grid

const y = (row: number) => margins.t + row * grid

// Dense prep sheets share one vocabulary: a ruled panel, a table whose rows hold several writing lines, and a header block.
function panel(title: string, column: number, row: number, columns: number, rows: number, options: { hint?: string; fill?: Fill } = {}): SheetElement {
  const element = makeElement('box', x(column), y(row), columns * grid, rows * grid)

  if (element.type !== 'box') throw new Error('Expected a box')

  return { ...element, title, hint: options.hint, fill: options.fill ?? 'lines', gridSize: grid, treatment: 'panel', cut: 1, inset: gap, padding: 0 }
}

interface TableOptions {
  hint?: string
  cols?: TableColumn[]
  lines?: number
  start?: number
}

function table(title: string, column: number, row: number, columns: number, rows: number, headers: string[], bodyRows: number, options: TableOptions = {}): SheetElement {
  const element = makeElement('table', x(column), y(row), columns * grid, rows * grid)

  if (element.type !== 'table') throw new Error('Expected a table')

  return { ...element, title, headers, rows: bodyRows, ...options, treatment: 'panel', inset: gap, padding: 0 }
}

function field(labels: string[], column: number, row: number, columns: number): SheetElement {
  const element = makeElement('field', x(column), y(row), columns * grid, grid)

  if (element.type !== 'field') throw new Error('Expected a field')

  return { ...element, label: labels[0] ?? '', labels, inset: .6, padding: 0 }
}

function text(value: string, column: number, row: number, columns: number, options: { size?: number; bold?: boolean; color?: string; dy?: number } = {}): SheetElement {
  const size = options.size ?? 2.2
  const element = makeElement('text', x(column), y(row) + (options.dy ?? 0), columns * grid, size)

  if (element.type !== 'text') throw new Error('Expected text')

  return { ...element, text: value, size, weight: options.bold ? 'bold' : 'normal', color: options.color ?? '#555555' }
}

function tracker(label: string, column: number, row: number, columns: number, rows: number, count: number): SheetElement {
  const element = makeElement('tracker', x(column), y(row), columns * grid, rows * grid)

  if (element.type !== 'tracker') throw new Error('Expected a tracker')

  return { ...element, label, count, columns: count, marker: 'square', inset: .6, padding: 0 }
}

const check: TableColumn = { kind: 'check', w: .55 }

const number: TableColumn = { kind: 'number', w: .45 }

const textColumn = (w: number): TableColumn => ({ kind: 'text', w })

// Title block: sheet name and a one-line purpose on the left, hand-filled fields on the right.
function header(title: string, purpose: string, rows: string[][], fieldColumn = 10): SheetElement[] {
  return [
    { ...text(title, 0, 0, fieldColumn - 1, { size: 5.2, bold: true, color: '#111111' }), y: y(0) + .2 },
    text(purpose, 0, 0, fieldColumn - 1, { size: 2.2, dy: 6.4 }),
    ...rows.map((labels, index) => field(labels, fieldColumn, index, 24 - fieldColumn)),
  ]
}

const tagLegend = (row: number) => [
  text('TAG   C character  ·  L location  ·  E event  ·  A arc  ·  D development', 0, row, 24, { size: 2.1, dy: -.3 }),
  text('HOOK   M main quest  ·  S side quest  ·  O one-off      PC   whose moment it is', 0, row, 24, { size: 2.1, dy: 2.3 }),
]

function setCard(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...header('SET CARD', 'Five points that paint one picture.', [['NAME OF THE SET'], ['SESSION', 'DATE']]),
      ...tagLegend(2),
      table('FIVE POINTS', 0, 3, 24, 17, ['#', 'TAG', 'HOOK', 'POINT  ·  put secrets in (brackets)', 'PC', 'USED'], 5, {
        lines: 3,
        cols: [{ kind: 'number', w: .5 }, { kind: 'letters', letters: 'CLEAD', w: 1.7 }, { kind: 'letters', letters: 'MSO', w: 1.1 }, textColumn(9), textColumn(1.1), { kind: 'check', w: 1 }],
      }),
      panel('CONNECTS TO', 0, 20, 11, 8, { hint: 'other sets' }),
      panel('IF IGNORED, OFFSCREEN', 11, 20, 13, 8, { hint: 'what happens anyway' }),
      panel('AT THE TABLE', 0, 28, 24, 8, { hint: 'what they did, what changed' }),
    ],
  }
}

function arcCard(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...header('ARC / VILLAIN', 'Five beats that build to a conclusion.', [['ARC OR VILLAIN'], ['SESSIONS', 'STARTED']]),
      text('Each beat: what happens, who is pushing it, what the characters can still change.', 0, 2, 24, { size: 2.1, dy: 1.6 }),
      table('FIVE BEATS', 0, 3, 24, 17, ['#', 'BEAT', 'WHO PUSHES IT', 'DONE'], 5, {
        lines: 3,
        cols: [{ kind: 'number', w: .5 }, textColumn(7.5), textColumn(2.6), { kind: 'check', w: .9 }],
      }),
      panel('WHAT THEY WANT', 0, 20, 12, 8),
      panel('WHAT STOPS THEM', 12, 20, 12, 8),
      panel('GRIM PORTENTS', 0, 28, 24, 8, { hint: 'what shows up first if nobody acts' }),
    ],
  }
}

function sessionPlan(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...header('SESSION PLAN', 'Five sets, one night.', [['TITLE'], ['SESSION', 'DATE']]),
      panel('STRONG START', 0, 2, 24, 4, { hint: 'where they stand, what is happening, what they must decide' }),
      table('THE FIVE SETS', 0, 6, 24, 12, ['#', 'SET  ·  PLACE OR PERSON', 'HOOK', 'RAN'], 5, {
        lines: 2,
        cols: [number, textColumn(7.5), { kind: 'letters', letters: 'MSO', w: 1.2 }, check],
      }),
      table('EVERY PC GETS A MOMENT', 0, 18, 24, 8, ['PLAYER  ·  PC', 'SET 1', 'SET 2', 'SET 3', 'SET 4', 'SET 5'], 6, {
        cols: [textColumn(3.4), check, check, check, check, check].map((column, index) => index ? { ...column, w: 1 } : column),
      }),
      panel('CURVEBALL BANK', 0, 26, 14, 10, { hint: 'grab an unused point' }),
      panel('HOOKS IN PLAY', 14, 26, 10, 6, { fill: 'none', hint: 'aim for all three' }),
      tracker('MAIN QUEST', 14.4, 27, 9, 1.6, 5),
      tracker('SIDE QUEST', 14.4, 28.6, 9, 1.6, 5),
      tracker('ONE-OFF', 14.4, 30.2, 9, 1.6, 5),
      panel('NEXT TIME', 14, 32, 10, 4),
    ],
  }
}

function afterSession(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...header('DEBRIEF', 'Same night. Ten minutes.', [['SESSION'], ['DATE']]),
      panel('IN THE PLAYERS\' WORDS', 0, 2, 24, 4, { hint: 'what they say happened' }),
      table('SET TRIAGE', 0, 6, 24, 18, ['POINT', 'USED', 'OUTCOME  /  OFFSCREEN IF UNTOUCHED'], 8, {
        lines: 2,
        cols: [textColumn(3.2), { kind: 'check', w: .9 }, textColumn(7)],
      }),
      panel('THE WORLD CHANGED', 0, 24, 12, 12, { hint: 'people, places, factions' }),
      panel('THREADS FOR NEXT PREP', 12, 24, 12, 12, { hint: 'what to open first' }),
    ],
  }
}

function lazyPrep(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...header('SESSION PREP', 'The eight steps, in order. Stop when the boxes are full.', [['SESSION'], ['DATE']]),
      table('1  ·  REVIEW THE CHARACTERS', 0, 2, 24, 6, ['', ''], 5, { hint: 'who  ·  what they want right now', cols: [textColumn(1.3), textColumn(4)] }),
      panel('2  ·  STRONG START', 0, 8, 24, 4, { hint: 'the first scene' }),
      table('3  ·  POTENTIAL SCENES', 0, 12, 24, 6, ['', ''], 5, { hint: 'one line each', cols: [number, textColumn(10)] }),
      table('4  ·  SECRETS & CLUES  1–5', 0, 18, 12, 6, ['', ''], 5, { cols: [number, textColumn(7)] }),
      table('SECRETS & CLUES  6–10', 12, 18, 12, 6, ['', ''], 5, { cols: [number, textColumn(7)], start: 6 }),
      panel('5  ·  FANTASTIC LOCATIONS', 0, 24, 12, 6),
      panel('6  ·  IMPORTANT NPCS', 12, 24, 12, 6),
      panel('7  ·  RELEVANT MONSTERS', 0, 30, 12, 6),
      panel('8  ·  MAGIC ITEM REWARDS', 12, 30, 12, 6),
    ],
  }
}

function runSheet(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...header('RUN SHEET', 'Glance, do not read.', [['SESSION'], ['DATE']]),
      panel('STRONG START', 0, 2, 24, 3),
      table('SCENES', 0, 5, 24, 6, ['', ''], 5, { cols: [check, textColumn(9)] }),
      table('SECRETS  ·  tick when found', 0, 11, 12, 6, ['', ''], 5, { cols: [check, textColumn(7)] }),
      table('SECRETS & CLUES  6–10', 12, 11, 12, 6, ['', ''], 5, { cols: [check, textColumn(7)] }),
      table('COMBAT', 0, 17, 24, 9, ['INIT', 'NAME', 'HP', 'NOTES  ·  CONDITIONS'], 7, { cols: [{ kind: 'text', w: 1 }, textColumn(3), textColumn(1.4), textColumn(4.5)] }),
      panel('WHAT ARE THE VILLAINS DOING NOW?', 0, 26, 12, 5),
      panel('NAMES AT HAND', 12, 26, 12, 5),
      panel('PLAYER IDEAS & LOOSE ENDS', 0, 31, 24, 5),
    ],
  }
}

function fiveMinute(): SheetDocument {
  return {
    ...structuredClone(blankDocument),
    els: [
      ...header('FIVE-MINUTE PREP', 'Low energy? These three are enough.', [['DATE']], 14),
      panel('1  ·  STRONG START', 0, 2, 24, 8, { hint: 'where they stand, what happens, what they decide' }),
      table('2  ·  SECRETS & CLUES  1–5', 0, 10, 12, 11, ['', ''], 5, { lines: 2, cols: [number, textColumn(7)] }),
      table('SECRETS & CLUES  6–10', 12, 10, 12, 11, ['', ''], 5, { lines: 2, cols: [number, textColumn(7)], start: 6 }),
      panel('3  ·  FANTASTIC LOCATION', 0, 21, 24, 5, { hint: 'one striking thing to see' }),
      panel('3  ·  FANTASTIC LOCATION', 0, 26, 24, 5),
      panel('3  ·  FANTASTIC LOCATION', 0, 31, 24, 5),
    ],
  }
}

function campaign(): SheetDocument {
  const front = (index: number, row: number): SheetElement[] => [
    field([`FRONT ${index}`], 0, row, 12),
    field(['GOAL'], 12, row, 12),
    table('GRIM PORTENTS', 0, row + 1, 24, 6, ['', ''], 5, { hint: 'tick as they come true', cols: [check, textColumn(11)] }),
  ]

  return {
    ...structuredClone(blankDocument),
    els: [
      ...header('CAMPAIGN', 'One goal, six truths, three fronts.', [['CAMPAIGN'], ['SETTING']]),
      panel('CAMPAIGN HOOK', 0, 2, 24, 6, { hint: 'a single major goal the characters share' }),
      table('SIX TRUTHS', 0, 8, 24, 7, ['', ''], 6, { hint: 'true of this world, known or secret', cols: [number, textColumn(11)] }),
      ...front(1, 15),
      ...front(2, 22),
      ...front(3, 29),
    ],
  }
}

export const documentTemplates = [
  { id: 'set', group: 'Prep', name: 'Set card', description: 'Five tagged points, links, and what happened', create: setCard },
  { id: 'session-plan', group: 'Prep', name: 'Session plan', description: 'Five sets, PC moments, and hook mix', create: sessionPlan },
  { id: 'prep', group: 'Prep', name: 'Session prep (8 steps)', description: 'The eight-step checklist as fixed-size boxes', create: lazyPrep },
  { id: 'five-minute', group: 'Prep', name: '5-minute prep', description: 'Strong start, secrets, locations', create: fiveMinute },
  { id: 'run', group: 'Play', name: 'Run sheet', description: 'Scenes, secrets, combat, and villains at a glance', create: runSheet },
  { id: 'after', group: 'Play', name: 'Debrief (after the session)', description: 'Triage points, record changes, seed next prep', create: afterSession },
  { id: 'arc', group: 'Campaign', name: 'Arc / villain', description: 'Five beats, motives, and portents', create: arcCard },
  { id: 'campaign', group: 'Campaign', name: 'Campaign worksheet', description: 'Hook, truths, and three fronts', create: campaign },
  { id: 'character', group: 'Sheets', name: 'Character overview', description: 'Abilities, combat values, skills, attacks, and resources', create: characterDocument },
  { id: 'npc', group: 'Sheets', name: 'NPC', description: 'Identity, motives, relationships, and notes', create: npcDocument },
  { id: 'location', group: 'Sheets', name: 'Location / town', description: 'Places, people, history, quests, and connections', create: locationDocument },
  { id: 'session', group: 'Sheets', name: 'Session log', description: 'Developments, activity, locations, and follow-ups', create: sessionDocument },
  { id: 'party', group: 'Sheets', name: 'Party tracker', description: 'Five compact character reference rows', create: partyDocument },
  { id: 'blank', group: 'Sheets', name: 'Blank page', description: 'Start from the grid', create: () => structuredClone(blankDocument) },
] as const

export type TemplateId = typeof documentTemplates[number]['id']
