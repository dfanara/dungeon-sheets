import { useEffect, useRef } from 'react'

import { editorStore, setEditor } from './store'

const minZoom = 1.13

const maxZoom = 15.12

export function useCanvasNavigation() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const workspace = ref.current

    if (!workspace) return

    let space = false
    let pan: { x: number; y: number; left: number; top: number } | null = null

    function keydown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return

      if (event.code === 'Space') {
        event.preventDefault()
        space = true
        workspace!.style.cursor = 'grab'
      }
    }

    function stop() {
      pan = null
      space = false
      workspace!.style.cursor = ''
    }

    function down(event: PointerEvent) {
      const background = event.target === workspace

      if (!space && !background && event.button !== 1) return

      event.preventDefault()
      event.stopPropagation()
      pan = { x: event.clientX, y: event.clientY, left: workspace!.scrollLeft, top: workspace!.scrollTop }
      workspace!.style.cursor = 'grabbing'
      workspace!.setPointerCapture(event.pointerId)
    }

    function move(event: PointerEvent) {
      if (!pan) return

      workspace!.scrollLeft = pan.left + pan.x - event.clientX
      workspace!.scrollTop = pan.top + pan.y - event.clientY
    }

    function up() {
      workspace!.style.cursor = space ? 'grab' : ''
      pan = null
    }

    function keyup(event: KeyboardEvent) {
      if (event.code === 'Space') stop()
    }

    function wheel(event: WheelEvent) {
      event.preventDefault()

      const state = editorStore.state
      const oldZoom = state.zoom
      const lineHeight = event.deltaMode === 1 ? 16 : 1
      const factor = Math.exp(-event.deltaY * lineHeight * .0018)
      const newZoom = Math.min(maxZoom, Math.max(minZoom, oldZoom * factor))

      if (newZoom === oldZoom) return

      const rect = workspace!.getBoundingClientRect()
      const offsetX = event.clientX - rect.left
      const offsetY = event.clientY - rect.top
      const contentX = workspace!.scrollLeft + offsetX
      const contentY = workspace!.scrollTop + offsetY
      const ratio = newZoom / oldZoom

      setEditor({ zoom: newZoom })
      requestAnimationFrame(() => {
        workspace!.scrollLeft = contentX * ratio - offsetX
        workspace!.scrollTop = contentY * ratio - offsetY
      })
    }

    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    window.addEventListener('blur', stop)
    workspace.addEventListener('pointerdown', down, true)
    workspace.addEventListener('pointermove', move)
    workspace.addEventListener('pointerup', up)
    workspace.addEventListener('pointercancel', up)
    workspace.addEventListener('lostpointercapture', up)
    workspace.addEventListener('wheel', wheel, { passive: false })

    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
      window.removeEventListener('blur', stop)
      workspace.removeEventListener('pointerdown', down, true)
      workspace.removeEventListener('pointermove', move)
      workspace.removeEventListener('pointerup', up)
      workspace.removeEventListener('pointercancel', up)
      workspace.removeEventListener('lostpointercapture', up)
      workspace.removeEventListener('wheel', wheel)
    }
  }, [])

  return ref
}
