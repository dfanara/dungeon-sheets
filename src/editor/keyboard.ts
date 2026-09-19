import { useEffect } from 'react'

import { duplicateSelection, groupSelection } from './arrange'
import { roundPosition } from './model'
import { deleteSelected, editorStore, redo, saveCurrentDocument, setEditor, undo, updateDocument } from './store'

const toolKeys = {
  v: 'select',
  b: 'box',
  f: 'field',
  t: 'text',
  r: 'rule',
} as const

function toolForKey(key: string) {
  if (key === 'v') return toolKeys.v

  if (key === 'b') return toolKeys.b

  if (key === 'f') return toolKeys.f

  if (key === 't') return toolKeys.t

  if (key === 'r') return toolKeys.r

  return null
}

function directionForKey(key: string): [number, number] | null {
  if (key === 'ArrowLeft') return [-1, 0]

  if (key === 'ArrowRight') return [1, 0]

  if (key === 'ArrowUp') return [0, -1]

  if (key === 'ArrowDown') return [0, 1]

  return null
}

export function useEditorKeyboard() {
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      const target = event.target

      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return

      if (event.metaKey || event.ctrlKey) {
        const key = event.key.toLowerCase()

        if (!['z', 'd', 'g', 'a', 's'].includes(key)) return

        event.preventDefault()

        if (key === 'z' && event.shiftKey) redo()

        if (key === 'z' && !event.shiftKey) undo()

        if (key === 'd') duplicateSelection()

        if (key === 'g') groupSelection(event.shiftKey)

        if (key === 'a') setEditor({ selectedIds: editorStore.state.document.els.map((element) => element.id), selectedId: editorStore.state.document.els.at(-1)?.id ?? null })

        if (key === 's') saveCurrentDocument()

        return
      }

      if (event.key === 'Escape') {
        setEditor({ selectedId: null, tool: 'select', previewMode: false })

        return
      }

      const tool = toolForKey(event.key.toLowerCase())

      if (tool) {
        setEditor({ tool })

        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        deleteSelected()

        return
      }

      const state = editorStore.state
      const selected = state.document.els.find((element) => element.id === state.selectedId)

      if (!selected) return

      const direction = directionForKey(event.key)

      if (!direction) return

      event.preventDefault()
      const distance = state.document.grid * (event.shiftKey ? 4 : 1)
      const selection = new Set(state.selectedIds)

      updateDocument((document) => ({
        ...document,
        els: document.els.map((element) => selection.has(element.id)
          ? { ...element, x: roundPosition(element.x + direction[0] * distance, document, 'x'), y: roundPosition(element.y + direction[1] * distance, document, 'y') }
          : element),
      }))
    }

    window.addEventListener('keydown', keydown)

    return () => window.removeEventListener('keydown', keydown)
  }, [])
}
