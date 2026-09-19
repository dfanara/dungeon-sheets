import { makeElement, pageSizes, type SheetDocument, type SheetElement } from './model'

export const sheetParts = [
  { name: 'Writing panel', detail: 'Ruled space for traits and lore', tool: 'box', columns: 11, rows: 9 },
  { name: 'Ability score', detail: 'A framed, handwritten value', tool: 'value', columns: 4, rows: 4 },
  { name: 'Identity field', detail: 'Names, classes, and short details', tool: 'field', columns: 8, rows: 2 },
  { name: 'Resource tracker', detail: 'Spell slots, charges, and uses', tool: 'tracker', columns: 8, rows: 3 },
  { name: 'Equipment ledger', detail: 'Items, quantity, and weight', tool: 'table', columns: 11, rows: 12 },
  { name: 'Section heading', detail: 'Give your page a clear hierarchy', tool: 'text', columns: 11, rows: 2 },
  { name: 'Identity banner', detail: 'Ribbon-framed character or location name', tool: 'field', columns: 12, rows: 3 },
  { name: 'Shield badge', detail: 'Armor, defense, or another key value', tool: 'value', columns: 4, rows: 4 },
  { name: 'Attached stat', detail: 'A value badge joined to its caption', tool: 'value', columns: 8, rows: 3 },
  { name: 'Captioned panel', detail: 'Ruled notes with a bottom caption', tool: 'box', columns: 6, rows: 8 },
  { name: 'Label strip', detail: 'A shaded heading for compact entries', tool: 'box', columns: 8, rows: 2 },
  { name: 'Section backplate', detail: 'A light backdrop for a group of components', tool: 'box', columns: 12, rows: 8 },
] as const

export type SheetPart = typeof sheetParts[number]

export function findPlacement(document: SheetDocument, part: { columns: number; rows: number }) {
  const page = pageSizes[document.page]
  const w = part.columns * document.grid
  const h = part.rows * document.grid
  const columns = Math.floor((page.width - document.margins.l - document.margins.r) / document.grid + .001)
  const rows = Math.floor((page.height - document.margins.t - document.margins.b) / document.grid + .001)

  for (let row = 0; row <= rows - part.rows; row += 1) {
    for (let column = 0; column <= columns - part.columns; column += 1) {
      const x = document.margins.l + column * document.grid
      const y = document.margins.t + row * document.grid
      const occupied = document.els.some((element) => x < element.x + element.w - .001 && x + w > element.x + .001 && y < element.y + Math.max(element.h, .2) - .001 && y + h > element.y + .001)

      if (occupied) continue

      return { x, y, w, h }
    }
  }

  return { x: document.margins.l, y: document.margins.t, w, h }
}

export function placePart(document: SheetDocument, part: SheetPart): SheetElement {
  const bounds = findPlacement(document, part)

  const { x, y, w, h } = bounds
  const element = makeElement(part.tool, x, y, w, h)

  if (element.type === 'field' && part.name === 'Identity banner') return { ...element, variant: 'banner', label: 'CHARACTER' }

  if (element.type === 'field' && part.name === 'Shield badge') return { ...element, variant: 'shield', label: 'AC' }

  if (element.type === 'field' && part.name === 'Attached stat') return { ...element, variant: 'attached', label: 'PASSIVE PERCEPTION' }

  if (element.type === 'box' && part.name === 'Captioned panel') return { ...element, caption: 'bottom', title: 'LANGUAGES', fill: 'lines' }

  if (element.type === 'box' && part.name === 'Label strip') return { ...element, treatment: 'strip', title: 'IDEAL', padding: 1 }

  if (element.type === 'box' && part.name === 'Section backplate') return { ...element, treatment: 'backplate', title: '' }

  if (element.type === 'box') return { ...element, title: 'FEATURES & TRAITS', fill: 'lines' }

  if (element.type === 'table') return { ...element, title: 'EQUIPMENT', headers: ['ITEM', 'QTY', 'WEIGHT'] }

  if (element.type === 'text') return { ...element, text: 'CHAPTER TITLE', weight: 'bold', size: 4 }

  if (element.type === 'field' && part.tool === 'value') return { ...element, label: 'ABILITY' }

  return element
}
