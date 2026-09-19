import { Store } from '@tanstack/store'

import { blankDocument, type SheetDocument, type SheetElement, type Tool } from './model'
import { createSavedDocument, updateSavedDocument } from './persistence'

interface EditorState {
  document: SheetDocument
  documentId: string | null
  documentName: string
  selectedId: string | null
  selectedIds: string[]
  past: SheetDocument[]
  future: SheetDocument[]
  previewMode: boolean
  showProperties: boolean
  tool: Tool
  zoom: number
  status: string
}

export const editorStore = new Store<EditorState>({
  document: structuredClone(blankDocument),
  documentId: null,
  documentName: 'Untitled sheet',
  selectedId: null,
  selectedIds: [],
  past: [],
  future: [],
  previewMode: false,
  showProperties: true,
  tool: 'select',
  zoom: 3.4,
  status: '',
})

export function setEditor(patch: Partial<EditorState>) {
  editorStore.setState((state) => ({ ...state, ...patch, selectedIds: patch.selectedIds ?? (patch.selectedId !== undefined ? patch.selectedId ? [patch.selectedId] : [] : state.selectedIds) }))
}

let gesture: SheetDocument | null = null

export function beginGesture() {
  gesture = editorStore.state.document
}

export function endGesture() {
  const before = gesture
  gesture = null

  if (before && before !== editorStore.state.document) editorStore.setState((state) => ({ ...state, past: [...state.past.slice(-99), before], future: [] }))
}

export function undo() {
  const state = editorStore.state
  const document = state.past.at(-1)

  if (!document) return

  setEditor({ document, past: state.past.slice(0, -1), future: [state.document, ...state.future], selectedId: null })
}

export function redo() {
  const state = editorStore.state
  const document = state.future[0]

  if (!document) return

  setEditor({ document, past: [...state.past, state.document], future: state.future.slice(1), selectedId: null })
}

export function setDocument(document: SheetDocument, meta?: { id: string | null; name: string }) {
  updateDocument(() => document)
  setEditor({ selectedId: null, tool: 'select', documentId: meta?.id ?? null, documentName: meta?.name ?? 'Untitled sheet' })
}

export function updateDocument(change: (document: SheetDocument) => SheetDocument) {
  editorStore.setState((state) => ({ ...state, document: change(state.document), past: gesture ? state.past : [...state.past.slice(-99), state.document], future: [] }))
}

export function updateElement(id: string, change: (element: SheetElement) => SheetElement) {
  updateDocument((document) => ({
    ...document,
    els: document.els.map((element) => (element.id === id ? change(element) : element)),
  }))
}

export function saveCurrentDocument() {
  const state = editorStore.state

  if (state.documentId) {
    updateSavedDocument(state.documentId, state.document)
    setEditor({ status: `${state.documentName} saved` })

    return
  }

  const id = createSavedDocument(state.documentName, state.document)

  setEditor({ documentId: id, status: `${state.documentName} saved as a new sheet` })
}

export function deleteSelected() {
  const ids = new Set(editorStore.state.selectedIds)

  if (!ids.size) return

  updateDocument((document) => ({
    ...document,
    els: document.els.filter((element) => !ids.has(element.id)),
  }))
  setEditor({ selectedId: null })
}
