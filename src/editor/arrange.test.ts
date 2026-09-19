import { beforeEach, expect, test } from 'bun:test'

import { alignedElements, duplicateSelection, groupSelection, reorderSelection, selectElement } from './arrange'
import { blankDocument, makeElement } from './model'
import { beginGesture, deleteSelected, editorStore, endGesture, redo, setEditor, undo, updateElement } from './store'

beforeEach(() => {
  setEditor({ document: { ...structuredClone(blankDocument), els: [makeElement('box', 10, 9, 20, 20), makeElement('box', 50, 40, 30, 20), makeElement('field', 110, 80, 20, 10)] }, past: [], future: [], selectedId: null })
})

test('a drag is one undoable edit and a new edit clears redo', () => {
  const original = editorStore.state.document
  const id = original.els[0]!.id

  beginGesture()
  updateElement(id, (element) => ({ ...element, x: 20 }))
  updateElement(id, (element) => ({ ...element, x: 30 }))
  endGesture()
  expect(editorStore.state.past).toHaveLength(1)
  undo()
  expect(editorStore.state.document).toEqual(original)
  redo()
  expect(editorStore.state.document.els[0]!.x).toBe(30)
  undo()
  updateElement(id, (element) => ({ ...element, x: 40 }))
  expect(editorStore.state.future).toHaveLength(0)
})

test('group selection, duplication and deletion preserve independent groups', () => {
  const [first, second] = editorStore.state.document.els

  selectElement(first!.id)
  selectElement(second!.id, true)
  groupSelection()
  const originalGroup = editorStore.state.document.els[0]!.groupId

  selectElement(null)
  selectElement(first!.id)
  expect(editorStore.state.selectedIds).toHaveLength(2)
  duplicateSelection()
  const copies = editorStore.state.document.els.slice(-2)

  expect(copies[0]!.groupId).not.toBe(originalGroup)
  expect(copies[0]!.groupId).toBe(copies[1]!.groupId)
  expect(new Set(editorStore.state.document.els.map((element) => element.id)).size).toBe(5)
  deleteSelected()
  expect(editorStore.state.document.els).toHaveLength(3)
  undo()
  expect(editorStore.state.document.els).toHaveLength(5)
})

test('distribution respects different widths and layer order is stable', () => {
  const elements = editorStore.state.document.els
  const ids = elements.map((element) => element.id)
  const distributed = alignedElements(elements, ids, 'horizontal')
  const gap1 = distributed[1]!.x - distributed[0]!.x - distributed[0]!.w
  const gap2 = distributed[2]!.x - distributed[1]!.x - distributed[1]!.w

  expect(gap1).toBeCloseTo(gap2)
  expect(distributed[0]!.x).toBe(elements[0]!.x)
  expect(distributed[2]!.x).toBe(elements[2]!.x)
  expect(elements[1]!.x).toBe(50)
  selectElement(ids[0]!)
  selectElement(ids[1]!, true)
  reorderSelection(true)
  expect(editorStore.state.document.els.map((element) => element.id)).toEqual([ids[2]!, ids[0]!, ids[1]!])
})

test('alignment moves a group as a unit without collapsing its children', () => {
  const elements = editorStore.state.document.els.map((element, index) => index < 2 ? { ...element, groupId: 'group01' } : element)
  const aligned = alignedElements(elements, elements.map((element) => element.id), 'left')

  expect(aligned[1]!.x - aligned[0]!.x).toBe(elements[1]!.x - elements[0]!.x)
  expect(aligned[2]!.x).toBe(aligned[0]!.x)
})
