import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { useStore } from '@tanstack/react-store'

import { exportPng, exportSheetFile, exportSvg, printSheet, readSheetFile } from './export'
import { pageSizes } from './model'
import { createSavedDocument, deleteSavedDocument, duplicateSavedDocument, renameSavedDocument, savedDocuments, type SavedDocument } from './persistence'
import { editorStore, redo, saveCurrentDocument, setDocument, setEditor, undo } from './store'
import { DeleteIcon, DuplicateIcon, EyeIcon, ExportIcon, FitIcon, ImportIcon, PanelIcon, RedoIcon, SaveIcon, SheetsIcon, UndoIcon } from './icons'

function formatUpdated(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()

  return sameDay ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function SheetRow({ entry, active, onOpen }: Readonly<{ entry: SavedDocument; active: boolean; onOpen: () => void }>) {
  const [name, setName] = useState(entry.name)

  useEffect(() => setName(entry.name), [entry.name])

  function commit() {
    const trimmed = name.trim() || 'Untitled sheet'

    setName(trimmed)

    if (trimmed !== entry.name) renameSavedDocument(entry.id, trimmed)
  }

  return (
    <div className={`sheet-row${active ? ' active' : ''}`}>
      <div
        className="sheet-row-open"
        role="button"
        tabIndex={0}
        title="Open this sheet"
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen()
          }
        }}
      >
        <input
          value={name}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => setName(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            event.stopPropagation()

            if (event.key === 'Enter') event.currentTarget.blur()
          }}
        />
        <small>{entry.document.page} · updated {formatUpdated(entry.updatedAt)}</small>
      </div>
      <div className="sheet-row-actions">
        <button type="button" className="icon-btn" title="Duplicate" aria-label="Duplicate" onClick={() => duplicateSavedDocument(entry)}><DuplicateIcon /></button>
        <button type="button" className="icon-btn" title="Delete" aria-label="Delete" onClick={() => {
          const wasActive = active

          deleteSavedDocument(entry.id)

          if (wasActive) setEditor({ documentId: null })
        }}><DeleteIcon /></button>
      </div>
    </div>
  )
}

export function Topbar() {
  const { document, documentId, documentName, status, past, future, previewMode, showProperties, zoom } = useStore(editorStore)
  const { data: saves } = useLiveQuery((query) => query.from({ save: savedDocuments }))
  const page = pageSizes[document.page]
  const [dock, setDock] = useState(false)
  const [name, setName] = useState(documentName)
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => setName(documentName), [documentName])

  useEffect(() => {
    if (!dock) return

    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDock(false)
    }

    window.addEventListener('keydown', keydown)

    return () => window.removeEventListener('keydown', keydown)
  }, [dock])

  function report(action: () => void, success: string) {
    try {
      action()
      setEditor({ status: success })
    } catch (error) {
      setEditor({ status: error instanceof Error ? error.message : 'Action failed' })
    }
  }

  function commitName() {
    const trimmed = name.trim() || 'Untitled sheet'

    setName(trimmed)
    setEditor({ documentName: trimmed })

    if (documentId) renameSavedDocument(documentId, trimmed)
  }

  function saveAsNew() {
    const id = createSavedDocument(documentName, document)

    setEditor({ documentId: id, status: `${documentName} saved as a new sheet` })
  }

  function open(entry: SavedDocument) {
    setDocument(structuredClone(entry.document), { id: entry.id, name: entry.name })
    setEditor({ status: `${entry.name} opened` })
    setDock(false)
  }

  return (
    <header className="topbar">
      <div className="brand">
        <strong>Dungeon Sheets</strong>
        <input className="doc-name" value={name} onChange={(event) => setName(event.target.value)} onBlur={commitName} onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }} aria-label="Sheet name" />
      </div>
      <output className="status-line">{status}</output>
      <div className="top-actions">
        <span className="page-meta">{document.page} · {page.width} × {page.height} mm</span>
        <span className="divider" />
        <button type="button" className="icon-btn" title="Undo (⌘Z)" aria-label="Undo" disabled={!past.length} onClick={undo}><UndoIcon /></button>
        <button type="button" className="icon-btn" title="Redo (⌘⇧Z)" aria-label="Redo" disabled={!future.length} onClick={redo}><RedoIcon /></button>
        <span className="divider" />
        <button type="button" className="icon-btn" title="Fit page to window" aria-label="Fit to window" onClick={() => {
          const workspace = window.document.querySelector('.workspace')

          if (workspace) setEditor({ zoom: Math.max(.5, Math.min((workspace.clientWidth - 64) / page.width, (workspace.clientHeight - 64) / page.height)) })
        }}><FitIcon /></button>
        <select aria-label="Page zoom" value={zoom} onChange={(event) => setEditor({ zoom: Number(event.target.value) })}>
          <option value={zoom}>{Math.round(zoom / (96 / 25.4) * 100)}%</option>
          {[.5, 1, 1.5, 2].map((scale) => <option key={scale} value={scale * 96 / 25.4}>{scale * 100}%</option>)}
        </select>
        <span className="divider" />
        <button type="button" className={`icon-btn${previewMode ? ' active' : ''}`} title="Toggle print preview" aria-label="Print preview" aria-pressed={previewMode} onClick={() => setEditor({ previewMode: !previewMode })}><EyeIcon /></button>
        <button type="button" className={`icon-btn${showProperties ? ' active' : ''}`} title="Toggle properties panel" aria-label="Properties panel" aria-pressed={showProperties} onClick={() => setEditor({ showProperties: !showProperties })}><PanelIcon /></button>
        <span className="divider" />
        <button type="button" className="icon-btn" title="Save (⌘S)" aria-label="Save" onClick={() => {
          try {
            saveCurrentDocument()
          } catch (error) {
            setEditor({ status: error instanceof Error ? error.message : 'Save failed' })
          }
        }}><SaveIcon /></button>
        <button type="button" className={`icon-btn${dock ? ' active' : ''}`} title="Saved sheets" aria-label="Saved sheets" aria-pressed={dock} onClick={() => setDock((current) => !current)}><SheetsIcon /></button>
        <button type="button" className="icon-btn" title="Import a sheet file" aria-label="Import" onClick={() => importInput.current?.click()}><ImportIcon /></button>
        <input ref={importInput} type="file" accept="application/json,.json" hidden onChange={(event) => {
          const file = event.target.files?.[0]

          event.target.value = ''

          if (!file) return

          void readSheetFile(file).then(({ name: importedName, document: importedDocument }) => {
            const id = createSavedDocument(importedName, importedDocument)

            setDocument(importedDocument, { id, name: importedName })
            setEditor({ status: `${importedName} imported` })
          }).catch((error: Error) => setEditor({ status: error.message }))
        }} />
        <button type="button" className="icon-btn" title="Export" aria-label="Export" popoverTarget="export-menu"><ExportIcon /></button>
        <div id="export-menu" className="export-popover" popover="auto">
          <button type="button" onClick={() => report(() => exportSheetFile(document, documentName), 'Sheet file exported')}>Sheet file (.json)</button>
          <button type="button" onClick={() => report(() => exportSvg(document), 'SVG exported')}>SVG</button>
          <button type="button" onClick={() => void exportPng(document).then(() => setEditor({ status: 'PNG exported' })).catch((error: Error) => setEditor({ status: error.message }))}>PNG · 300 DPI</button>
          <button type="button" onClick={() => report(() => printSheet(document), 'Print opened')}>Print</button>
        </div>
      </div>

      {dock && <button type="button" className="dock-scrim" aria-label="Close panel" onClick={() => setDock(false)} />}
      {dock && (
        <div className="dock-panel sheets-panel" role="region" aria-label="Saved sheets">
          <div className="dock-header">
            <h2>Saved sheets</h2>
            <button type="button" className="icon-btn" title="Close" aria-label="Close" onClick={() => setDock(false)}>×</button>
          </div>
          <div className="dock-body">
            <button className="wide" type="button" onClick={saveAsNew}>Save current as new sheet</button>
            {saves.length === 0 && <p className="help compact">No saved sheets yet. Save the current sheet, or import a file, to start building a library.</p>}
            <div className="sheet-list">
              {[...saves].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((entry) => (
                <SheetRow key={entry.id} entry={entry} active={entry.id === documentId} onOpen={() => open(entry)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
