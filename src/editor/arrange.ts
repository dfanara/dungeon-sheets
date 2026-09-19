import { makeId, type SheetElement } from './model'
import { editorStore, setEditor, updateDocument } from './store'

export function selectElement(id: string | null, additive = false) {
  const { document, selectedIds } = editorStore.state
  const target = document.els.find((element) => element.id === id)
  const ids = target ? document.els.filter((element) => element.id === id || target.groupId && element.groupId === target.groupId).map((element) => element.id) : []
  const matches = new Set(ids)
  const next = additive ? selectedIds.includes(id ?? '') ? selectedIds.filter((key) => !matches.has(key)) : [...new Set([...selectedIds, ...ids])] : ids

  setEditor({ selectedIds: next, selectedId: next.at(-1) ?? null })
}

export function duplicateSelection() {
  const { document, selectedIds } = editorStore.state
  const groups = new Map<string, string>()
  const selected = new Set(selectedIds)

  const copies = document.els.filter((element) => selected.has(element.id)).map((element) => {
    if (element.groupId && !groups.has(element.groupId)) groups.set(element.groupId, makeId())

    return { ...element, id: makeId(), groupId: element.groupId ? groups.get(element.groupId) : undefined, x: element.x + document.grid, y: element.y + document.grid }
  })

  if (!copies.length) return

  updateDocument((current) => ({ ...current, els: [...current.els, ...copies] }))
  setEditor({ selectedId: copies.at(-1)?.id ?? null, selectedIds: copies.map((element) => element.id) })
}

export function groupSelection(ungroup = false) {
  const ids = new Set(editorStore.state.selectedIds)
  const groupId = ungroup ? undefined : makeId()

  updateDocument((document) => ({ ...document, els: document.els.map((element) => ids.has(element.id) ? { ...element, groupId } : element) }))
}

export function reorderSelection(front: boolean) {
  const ids = new Set(editorStore.state.selectedIds)

  updateDocument((document) => {
    const selected = document.els.filter((element) => ids.has(element.id))
    const others = document.els.filter((element) => !ids.has(element.id))

    return { ...document, els: front ? [...others, ...selected] : [...selected, ...others] }
  })
}

export function alignedElements(elements: SheetElement[], ids: string[], mode: 'left' | 'top' | 'horizontal' | 'vertical') {
  const matches = new Set(ids)
  const selected = elements.filter((element) => matches.has(element.id))
  const units = new Map<string, { id: string; x: number; y: number; w: number; h: number }>()

  for (const element of selected) {
    const id = element.groupId ?? element.id
    const unit = units.get(id)
    const x = Math.min(unit?.x ?? element.x, element.x)
    const y = Math.min(unit?.y ?? element.y, element.y)
    const right = Math.max(unit ? unit.x + unit.w : element.x + element.w, element.x + element.w)
    const bottom = Math.max(unit ? unit.y + unit.h : element.y + element.h, element.y + element.h)

    units.set(id, { id, x, y, w: right - x, h: bottom - y })
  }

  const items = [...units.values()]

  if (items.length < 2) return elements

  const axis = mode === 'left' || mode === 'horizontal' ? 'x' : 'y'
  const size = axis === 'x' ? 'w' : 'h'
  const ordered = [...items].sort((a, b) => a[axis] - b[axis])
  const start = Math.min(...items.map((element) => element[axis]))
  const end = Math.max(...items.map((element) => element[axis] + element[size]))
  const gap = (end - start - items.reduce((sum, element) => sum + element[size], 0)) / (items.length - 1)
  const positions = new Map<string, number>()
  let cursor = start

  for (const element of ordered) {
    positions.set(element.id, mode === 'left' || mode === 'top' ? start : cursor)
    cursor += element[size] + gap
  }

  return elements.map((element) => {
    const key = element.groupId ?? element.id
    const position = positions.get(key)
    const unit = units.get(key)

    return matches.has(element.id) && position !== undefined && unit
      ? { ...element, [axis]: element[axis] + position - unit[axis] }
      : element
  })
}

export function alignSelection(mode: 'left' | 'top' | 'horizontal' | 'vertical') {
  updateDocument((document) => ({ ...document, els: alignedElements(document.els, editorStore.state.selectedIds, mode) }))
}
