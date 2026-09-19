import { findPlacement } from './library'
import { makeId, type BoxElement, type FieldElement, type SheetDocument, type SheetElement } from './model'

export function characterSummary(document: SheetDocument): SheetElement[] {
  const placement = findPlacement(document, { columns: 24, rows: 12 })

  const groupId = makeId()
  const bounds = (column: number, row: number, columns: number, rows: number) => ({ id: makeId(), groupId, x: placement.x + column * document.grid, y: placement.y + row * document.grid, w: columns * document.grid, h: rows * document.grid })
  const field = (label: string, variant: FieldElement['variant'], column: number, row: number, columns: number, rows: number): FieldElement => ({ ...bounds(column, row, columns, rows), type: 'field', label, variant, padding: 1 })
  const panel = (title: string, column: number, row: number, columns: number, rows: number): BoxElement => ({ ...bounds(column, row, columns, rows), type: 'box', title, caption: 'bottom', fill: 'lines', gridSize: 5, cut: 1.5, padding: 2 })

  return [
    { ...panel('', 0, 0, 24, 12), treatment: 'backplate', fill: 'none', inset: 0 },
    field('CHARACTER', 'banner', 0, 0, 9, 3),
    field('AC', 'shield', 9, 0, 3, 4),
    field('MAX HP', 'box', 12, 0, 3, 4),
    field('SPEED', 'box', 15, 0, 3, 4),
    field('PERCEPTION', 'attached', 18, 0, 6, 4),
    { ...panel('IDEAL', 0, 4, 4, 2), treatment: 'strip', padding: 1 },
    { ...panel('INSTINCT', 0, 6, 4, 2), treatment: 'strip', padding: 1 },
    { ...panel('BOND', 0, 8, 4, 2), treatment: 'strip', padding: 1 },
    { ...panel('FLAW', 0, 10, 4, 2), treatment: 'strip', padding: 1 },
    panel('LANGUAGES', 4, 4, 4, 8),
    panel('RESISTANCES', 8, 4, 4, 8),
    panel('SENSES', 12, 4, 4, 8),
    field('SAVE DC', 'attached', 16, 4, 8, 3),
    panel('SPECIAL ITEMS', 16, 7, 8, 5),
  ]
}
