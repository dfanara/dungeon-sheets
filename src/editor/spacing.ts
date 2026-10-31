import type { SheetElement } from './model'

export const defaultInset = 1

export const defaultPadding = 2

export function insetBounds<T extends { x: number; y: number; w: number; h: number }>(bounds: T, amount: number): T {
  const horizontal = Math.max(0, Math.min(amount, bounds.w / 4))
  const vertical = Math.max(0, Math.min(amount, bounds.h / 4))

  return { ...bounds, x: bounds.x + horizontal, y: bounds.y + vertical, w: bounds.w - horizontal * 2, h: bounds.h - vertical * 2 }
}

export function frameBounds<T extends SheetElement>(element: T): T {
  return insetBounds(element, element.inset ?? (element.type === 'rule' || element.type === 'text' ? 0 : defaultInset))
}

export function contentBounds<T extends SheetElement>(element: T): T {
  return insetBounds(element, element.padding ?? defaultPadding)
}

// A conservative advance estimate keeps single-line labels inside their allotted band.
export function labelLength(text: string, size: number, width: number) {
  return text.length * size * .65 > width ? Math.max(.1, width) : undefined
}

export const labelGap = 2

// Divides a content band into evenly sized cells for a multi-label field, mirroring how table headers split into columns.
export function splitCells(content: { x: number; w: number }, count: number) {
  const cellWidth = content.w / count

  return Array.from({ length: count }, (_, index) => ({
    x: content.x + index * cellWidth,
    w: Math.max(0, cellWidth - (index < count - 1 ? labelGap : 0)),
  }))
}

// Pitch of ruled writing lines, matching the default A5 layout grid so lines line up with panel edges.
export const rulePitch = 16 / 3

export const panelHeader = 4.33

export const columnHeader = 5.33

// Average advance per em for the sheet's faces: bold serif capitals run wide, small sans text runs narrow.
export const capsEm = .8

export const sansEm = .5

// Returns a textLength only when the text genuinely cannot fit, so short labels are never stretched.
export function fitLength(text: string, size: number, em: number, width: number) {
  return text.length * size * em > width ? Math.max(.1, width) : undefined
}

// Bands are fixed so resizing a ruled table stretches its rows, never its headings; the grid-aligned templates land on rulePitch exactly.
export function tableLayout(element: { title: string; headers: string[]; rows: number; lines?: number }, contentHeight: number) {
  const count = Math.max(1, Math.round(element.rows)) * Math.max(1, Math.round(element.lines ?? 1))
  const hasHeads = element.headers.some((head) => head.trim() !== '')
  const titleBand = element.title ? panelHeader : 0
  const headBand = hasHeads ? (element.title ? columnHeader : panelHeader) : 0
  const pitch = Math.max(0, (contentHeight - titleBand - headBand) / count)

  return { count, titleBand, headBand, pitch, header: titleBand + headBand }
}
