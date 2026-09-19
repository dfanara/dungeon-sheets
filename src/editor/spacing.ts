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
