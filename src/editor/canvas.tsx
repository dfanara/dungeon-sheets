import { useRef, useState } from 'react'
import { useStore } from '@tanstack/react-store'

import { makeElement, pageSizes, round, roundPosition, type SheetElement } from './model'
import { beginGesture, editorStore, endGesture, setEditor, updateDocument } from './store'
import { selectElement } from './arrange'
import { Selection, SheetElementView } from './sheet-element'
import { printStyle } from './print-style'
import { useCanvasNavigation } from './navigation'

interface DragState {
  mode: 'draw' | 'move' | 'resize' | 'marquee'
  startX: number
  startY: number
  elementX: number
  elementY: number
  elementW?: number
  elementH?: number
  handle?: string
  originals?: SheetElement[]
  previousSelection?: string[]
}

export function EditorCanvas() {
  const { document, selectedId, selectedIds, tool, zoom, previewMode } = useStore(editorStore)
  const [preview, setPreview] = useState<SheetElement | null>(null)
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const workspaceRef = useCanvasNavigation()
  const page = pageSizes[document.page]
  const contentWidth = page.width - document.margins.l - document.margins.r
  const contentHeight = page.height - document.margins.t - document.margins.b
  const selected = document.els.find((element) => element.id === selectedId)
  const selection = new Set(selectedIds)

  function coordinates(clientX: number, clientY: number) {
    const rect = svgRef.current?.getBoundingClientRect()

    return {
      x: roundPosition((clientX - (rect?.left ?? 0)) / zoom, document, 'x'),
      y: roundPosition((clientY - (rect?.top ?? 0)) / zoom, document, 'y'),
    }
  }

  function pointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (previewMode || event.button !== 0) return

    const point = coordinates(event.clientX, event.clientY)

    const target = event.target instanceof SVGElement
      ? event.target.closest('[data-element-id]')
      : null

    const id = target?.getAttribute('data-element-id') ?? null

    const handle = event.target instanceof SVGElement
      ? event.target.getAttribute('data-handle')
      : null

    event.currentTarget.setPointerCapture(event.pointerId)
    beginGesture()

    if (tool === 'select') {
      const element = document.els.find((candidate) => candidate.id === id)

      if (handle && selected) {
        dragRef.current = {
          mode: 'resize',
          startX: point.x,
          startY: point.y,
          elementX: selected.x,
          elementY: selected.y,
          elementW: selected.w,
          elementH: selected.h,
          handle,
        }

        return
      }

      if (event.shiftKey || !id || !selectedIds.includes(id)) selectElement(id, event.shiftKey)

      if (element) dragRef.current = { mode: 'move', startX: point.x, startY: point.y, elementX: element.x, elementY: element.y, originals: document.els }

      if (!element) dragRef.current = { mode: 'marquee', startX: point.x, startY: point.y, elementX: point.x, elementY: point.y, previousSelection: event.shiftKey ? selectedIds : [] }

      return
    }

    dragRef.current = { mode: 'draw', startX: point.x, startY: point.y, elementX: point.x, elementY: point.y }
  }

  function pointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current

    if (!drag) return

    const point = coordinates(event.clientX, event.clientY)

    if (drag.mode === 'marquee') {
      setMarquee({ x: Math.min(point.x, drag.startX), y: Math.min(point.y, drag.startY), w: Math.abs(point.x - drag.startX), h: Math.abs(point.y - drag.startY) })

      return
    }

    if (drag.mode === 'move' && selectedId) {
      const originals = new Map(drag.originals?.map((element) => [element.id, element]))
      const ids = new Set(editorStore.state.selectedIds)

      updateDocument((current) => ({
        ...current,
        els: current.els.map((element) => {
          const original = originals.get(element.id)

          return ids.has(element.id) && original
            ? { ...element, x: original.x + roundPosition(drag.elementX + point.x - drag.startX, current, 'x') - drag.elementX, y: original.y + roundPosition(drag.elementY + point.y - drag.startY, current, 'y') - drag.elementY }
            : element
        }),
      }))

      return
    }

    if (drag.mode === 'resize' && selectedId) {
      const dx = point.x - drag.startX
      const dy = point.y - drag.startY
      const handle = drag.handle ?? ''
      const originalW = drag.elementW ?? document.grid
      const originalH = drag.elementH ?? document.grid

      updateDocument((current) => ({
        ...current,
        els: current.els.map((element) => {
          if (element.id !== selectedId) return element

          const west = handle.includes('w')
          const north = handle.includes('n')
          const width = Math.max(current.grid, round(originalW + (west ? -dx : handle.includes('e') ? dx : 0), current))
          const height = element.type === 'rule' ? 0 : Math.max(current.grid, round(originalH + (north ? -dy : handle.includes('s') ? dy : 0), current))

          return {
            ...element,
            x: west ? roundPosition(drag.elementX + originalW - width, current, 'x') : element.x,
            y: north ? roundPosition(drag.elementY + originalH - height, current, 'y') : element.y,
            w: width,
            h: height,
          }
        }),
      }))

      return
    }

    if (tool === 'select') return

    const x = Math.min(point.x, drag.startX)
    const y = Math.min(point.y, drag.startY)
    const w = Math.max(document.grid, Math.abs(point.x - drag.startX))
    const h = tool === 'rule' ? 0 : Math.max(document.grid, Math.abs(point.y - drag.startY))

    setPreview(makeElement(tool, x, y, w, h))
  }

  function pointerUp(event: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current

    if (drag?.mode === 'marquee' && marquee) {
      const enclosed = document.els.filter((element) => element.x >= marquee.x && element.y >= marquee.y && element.x + element.w <= marquee.x + marquee.w && element.y + element.h <= marquee.y + marquee.h)
      const groups = new Set(enclosed.map((element) => element.groupId).filter(Boolean))
      const enclosedIds = new Set(enclosed.map((element) => element.id))
      const ids = [...new Set([...(drag.previousSelection ?? []), ...document.els.filter((element) => enclosedIds.has(element.id) || element.groupId && groups.has(element.groupId)).map((element) => element.id)])]

      setEditor({ selectedIds: ids, selectedId: ids.at(-1) ?? null })
    }

    if (drag?.mode === 'draw') {
      const point = coordinates(event.clientX, event.clientY)
      const moved = Math.abs(point.x - drag.startX) + Math.abs(point.y - drag.startY) > .1
      let element = preview

      if (!moved && tool === 'field') element = makeElement('field', point.x, point.y, document.grid * 10, document.grid)

      if (!moved && tool === 'value') element = makeElement('value', point.x, point.y, document.grid * 4, document.grid * 4)

      if (!moved && tool === 'tracker') element = makeElement('tracker', point.x, point.y, document.grid * 8, document.grid * 3)

      if (!moved && tool === 'table') element = makeElement('table', point.x, point.y, document.grid * 12, document.grid * 8)

      if (!moved && tool === 'text') element = makeElement('text', point.x, point.y, document.grid * 8, document.grid)

      if (element) {
        updateDocument((current) => ({ ...current, els: [...current.els, element] }))
        setEditor({ selectedId: element.id, tool: 'select' })
      }
    }

    dragRef.current = null
    setPreview(null)
    setMarquee(null)
    endGesture()
  }

  function pointerCancel() {
    dragRef.current = null
    setPreview(null)
    setMarquee(null)
    endGesture()
  }

  return (
    <div ref={workspaceRef} className={`workspace${previewMode ? ' print-preview' : ''}`}>
      <svg
        ref={svgRef}
        id="sheet-canvas"
        className="sheet-canvas"
        viewBox={`0 0 ${page.width} ${page.height}`}
        width={page.width * zoom}
        height={page.height * zoom}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerCancel}
        onLostPointerCapture={pointerCancel}
      >
        <defs>
          <style>{printStyle}</style>
          <pattern id="layout-grid" x={document.margins.l} y={document.margins.t} width={document.grid} height={document.grid} patternUnits="userSpaceOnUse">
            <path d={`M ${document.grid} 0 L 0 0 0 ${document.grid}`} fill="none" stroke="#c8d4de" strokeWidth=".18" />
          </pattern>
          <pattern id="fill-lines" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 0 5 H 5" stroke="#c7c7c7" strokeWidth=".12" /></pattern>
          <pattern id="fill-squares" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 H 0 V 5" fill="none" stroke="#c7c7c7" strokeWidth=".12" /></pattern>
          <pattern id="fill-dots" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx=".5" cy=".5" r=".22" fill="#b4b4b4" /></pattern>
        </defs>
        <rect width={page.width} height={page.height} fill="white" />
        {document.showGrid && <rect data-chrome="grid" x={document.margins.l} y={document.margins.t} width={contentWidth} height={contentHeight} fill="url(#layout-grid)" />}
        <rect data-chrome="margins" x={document.margins.l} y={document.margins.t} width={page.width - document.margins.l - document.margins.r} height={page.height - document.margins.t - document.margins.b} fill="none" stroke="#7fb2e5" strokeWidth=".2" strokeDasharray="1 1" />
        {document.els.map((element) => <SheetElementView key={element.id} element={element} />)}
        {preview && <g data-chrome="drawing"><SheetElementView element={preview} /></g>}
        {marquee && <rect data-chrome="marquee" x={marquee.x} y={marquee.y} width={marquee.w} height={marquee.h} fill="#e2a53c" fillOpacity=".12" stroke="#e2a53c" strokeWidth=".25" pointerEvents="none" />}
        {document.els.filter((element) => selection.has(element.id)).map((element) => <Selection key={element.id} element={element} handles={selectedIds.length === 1} />)}
      </svg>
    </div>
  )
}
