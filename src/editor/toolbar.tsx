import { useEffect, useState } from 'react'
import { useStore } from '@tanstack/react-store'

import { editorStore, setDocument, setEditor, updateDocument } from './store'
import { placePart, sheetParts, type SheetPart } from './library'
import { blankDocument, documentTemplates, type Tool } from './model'
import { SheetElementView } from './sheet-element'
import { printStyle } from './print-style'
import { characterSummary } from './summary-part'
import { ComponentsIcon, LayoutsIcon, toolIcons } from './icons'

const previews = sheetParts.map((part) => {
  const element = placePart(blankDocument, part)

  return { part, element: { ...element, id: `preview-${part.name.replaceAll(' ', '-')}` } }
})

const tools: Tool[] = ['select', 'box', 'field', 'value', 'tracker', 'table', 'text', 'rule']

function insertPart(part: SheetPart) {
  const element = placePart(editorStore.state.document, part)

  updateDocument((document) => ({ ...document, els: [...document.els, element] }))
  setEditor({ selectedId: element.id, tool: 'select', status: `${part.name} added` })
}

type Dock = 'components' | 'layouts' | null

export function Toolbar() {
  const activeTool = useStore(editorStore, (state) => state.tool)
  const [dock, setDock] = useState<Dock>(null)

  useEffect(() => {
    if (!dock) return

    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDock(null)
    }

    window.addEventListener('keydown', keydown)

    return () => window.removeEventListener('keydown', keydown)
  }, [dock])

  function toggle(next: Exclude<Dock, null>) {
    setDock((current) => (current === next ? null : next))
  }

  return (
    <>
      <nav className="tool-rail" aria-label="Sheet components">
        <div className="tool-buttons" role="group" aria-label="Drawing tools">
          {tools.map((tool) => {
            const ToolIcon = toolIcons[tool]

            return (
              <button
                key={tool}
                type="button"
                title={`${tool[0]!.toUpperCase()}${tool.slice(1)} tool`}
                aria-label={`${tool} tool`}
                aria-pressed={activeTool === tool}
                className={`icon-btn${activeTool === tool ? ' active' : ''}`}
                onClick={() => setEditor({ tool })}
              >
                <ToolIcon />
              </button>
            )
          })}
        </div>
        <div className="dock-buttons">
          <button type="button" title="Components" aria-label="Components" aria-pressed={dock === 'components'} className={`icon-btn labeled${dock === 'components' ? ' active' : ''}`} onClick={() => toggle('components')}>
            <ComponentsIcon /> Components
          </button>
          <button type="button" title="Layouts" aria-label="Layouts" aria-pressed={dock === 'layouts'} className={`icon-btn labeled${dock === 'layouts' ? ' active' : ''}`} onClick={() => toggle('layouts')}>
            <LayoutsIcon /> Layouts
          </button>
        </div>
      </nav>

      {dock && <button type="button" className="dock-scrim" aria-label="Close panel" onClick={() => setDock(null)} />}

      {dock === 'components' && (
        <div className="dock-panel" role="region" aria-label="Components">
          <div className="dock-header">
            <h2>Components</h2>
            <button type="button" className="icon-btn" title="Close" aria-label="Close" onClick={() => setDock(null)}>×</button>
          </div>
          <div className="dock-body">
            <button className="wide" type="button" onClick={() => {
              const elements = characterSummary(editorStore.state.document)

              updateDocument((document) => ({ ...document, els: [...document.els, ...elements] }))
              setEditor({ selectedIds: elements.map((element) => element.id), selectedId: elements[0]!.id, tool: 'select', status: 'Character summary added · Ungroup to customize individual pieces' })
              setDock(null)
            }}>Add character summary · Grouped · 24 × 12</button>
            <div className="part-library" style={{ marginTop: 12 }}>
              {previews.map(({ part, element }) => (
                <button key={part.name} className="part-card" type="button" onClick={() => {
                  insertPart(part)
                  setDock(null)
                }}>
                  {element && <svg className="part-preview" aria-hidden="true" viewBox={`${element.x - 2} ${element.y - 2} ${element.w + 4} ${element.h + 4}`}><style>{printStyle}</style><SheetElementView element={element} /></svg>}
                  <span>{part.name}</span><small>{part.detail}</small><em>{part.columns} × {part.rows} cells · Add</em>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {dock === 'layouts' && (
        <div className="dock-panel" role="region" aria-label="Layouts">
          <div className="dock-header">
            <h2>Replace page with a layout</h2>
            <button type="button" className="icon-btn" title="Close" aria-label="Close" onClick={() => setDock(null)}>×</button>
          </div>
          <div className="dock-body">
            <div className="layout-list">
              {documentTemplates.map((template) => (
                <button key={template.id} type="button" onClick={() => {
                  setDocument(template.create(), { id: null, name: template.name })
                  setDock(null)
                }}>
                  {template.name}
                  <small>{template.description}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
