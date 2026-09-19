import { useStore } from '@tanstack/react-store'

import { pageSizes, type BoxElement, type FieldElement, type Fill, type SheetElement, type TableElement, type TextElement, type TrackerElement } from './model'
import { deleteSelected, editorStore, updateDocument, updateElement } from './store'
import { alignSelection, duplicateSelection, groupSelection, reorderSelection, selectElement } from './arrange'
import { defaultInset, defaultPadding } from './spacing'
import { AlignLeftIcon, AlignTopIcon, BackIcon, DeleteIcon, DistributeHIcon, DistributeVIcon, DuplicateIcon, FrontIcon, GroupIcon, UngroupIcon, toolIcons } from './icons'

function parseFill(value: string): Fill {
  if (value === 'dots' || value === 'squares' || value === 'lines') return value

  return 'none'
}

function parseFieldVariant(value: string) {
  if (value === 'box' || value === 'circle' || value === 'shield' || value === 'banner' || value === 'attached') return value

  return 'line'
}

function parseMarker(value: string) {
  return value === 'square' ? 'square' : 'circle'
}

function NumberField({ label, value, unit = 'mm', onChange }: Readonly<{ label: string; value: number; unit?: string; onChange: (value: number) => void }>) {
  return (
    <label className="control-row">
      <span>{label}</span>
      <span className="number-input"><input type="number" step="0.1" value={Number(value.toFixed(2))} onChange={(event) => {
        if (Number.isFinite(event.target.valueAsNumber)) onChange(event.target.valueAsNumber)
      }} />{unit && <small>{unit}</small>}</span>
    </label>
  )
}

function BoxControls({ element }: Readonly<{ element: BoxElement }>) {
  return (
    <>
      <label className="control-row"><span>Treatment</span><select value={element.treatment ?? 'frame'} onChange={(event) => updateElement(element.id, (current) => current.type === 'box' ? { ...current, treatment: event.target.value === 'backplate' ? 'backplate' : event.target.value === 'strip' ? 'strip' : 'frame' } : current)}><option value="frame">Frame</option><option value="backplate">Backplate</option><option value="strip">Label strip</option></select></label>
      <label className="control-row"><span>Caption</span><select value={element.caption ?? 'top'} onChange={(event) => updateElement(element.id, (current) => current.type === 'box' ? { ...current, caption: event.target.value === 'bottom' ? 'bottom' : 'top' } : current)}><option value="top">Top</option><option value="bottom">Bottom</option></select></label>
      <label className="control-row"><span>Title</span><input value={element.title} onChange={(event) => updateElement(element.id, (current) => current.type === 'box' ? { ...current, title: event.target.value } : current)} /></label>
      <label className="control-row"><span>Fill</span><select value={element.fill} onChange={(event) => updateElement(element.id, (current) => current.type === 'box' ? { ...current, fill: parseFill(event.target.value) } : current)}><option>none</option><option>dots</option><option>squares</option><option>lines</option></select></label>
      {element.fill === 'lines' && <NumberField label="Line spacing" value={element.gridSize} onChange={(gridSize) => updateElement(element.id, (current) => current.type === 'box' ? { ...current, gridSize: Math.max(1, gridSize) } : current)} />}
    </>
  )
}

function FieldControls({ element }: Readonly<{ element: FieldElement }>) {
  return (
    <>
      <label className="control-row"><span>Label</span><input value={element.label} onChange={(event) => updateElement(element.id, (current) => current.type === 'field' ? { ...current, label: event.target.value } : current)} /></label>
      <label className="control-row"><span>Style</span><select value={element.variant ?? 'line'} onChange={(event) => updateElement(element.id, (current) => current.type === 'field' ? { ...current, variant: parseFieldVariant(event.target.value) } : current)}><option value="line">Underline</option><option value="box">Value box</option><option value="circle">Circle</option><option value="shield">Shield</option><option value="banner">Banner</option><option value="attached">Attached stat</option></select></label>
    </>
  )
}

function TrackerControls({ element }: Readonly<{ element: TrackerElement }>) {
  return (
    <>
      <label className="control-row"><span>Label</span><input value={element.label} onChange={(event) => updateElement(element.id, (current) => current.type === 'tracker' ? { ...current, label: event.target.value } : current)} /></label>
      <NumberField label="Markers" value={element.count} unit="" onChange={(count) => updateElement(element.id, (current) => current.type === 'tracker' ? { ...current, count: Math.max(1, Math.round(count)) } : current)} />
      <NumberField label="Columns" value={element.columns} unit="" onChange={(columns) => updateElement(element.id, (current) => current.type === 'tracker' ? { ...current, columns: Math.max(1, Math.round(columns)) } : current)} />
      <label className="control-row"><span>Marker</span><select value={element.marker} onChange={(event) => updateElement(element.id, (current) => current.type === 'tracker' ? { ...current, marker: parseMarker(event.target.value) } : current)}><option value="circle">Circle</option><option value="square">Square</option></select></label>
    </>
  )
}

function TableControls({ element }: Readonly<{ element: TableElement }>) {
  return (
    <>
      <label className="control-row"><span>Title</span><input value={element.title} onChange={(event) => updateElement(element.id, (current) => current.type === 'table' ? { ...current, title: event.target.value } : current)} /></label>
      <label className="control-row"><span>Columns</span><input value={element.headers.join(',')} onChange={(event) => updateElement(element.id, (current) => current.type === 'table' ? { ...current, headers: event.target.value.split(',') } : current)} /></label>
      <NumberField label="Rows" value={element.rows} unit="" onChange={(rows) => updateElement(element.id, (current) => current.type === 'table' ? { ...current, rows: Math.max(1, Math.round(rows)) } : current)} />
    </>
  )
}

function TextControls({ element }: Readonly<{ element: TextElement }>) {
  return <>
    <label className="control-row"><span>Text</span><input value={element.text} onChange={(event) => updateElement(element.id, (current) => current.type === 'text' ? { ...current, text: event.target.value } : current)} /></label>
    <NumberField label="Type size" value={element.size} onChange={(size) => updateElement(element.id, (current) => current.type === 'text' ? { ...current, size: Math.max(1, size) } : current)} />
    <label className="control-row"><span>Weight</span><select value={element.weight} onChange={(event) => updateElement(element.id, (current) => current.type === 'text' ? { ...current, weight: event.target.value === 'bold' ? 'bold' : 'normal' } : current)}><option value="normal">Regular</option><option value="bold">Bold</option></select></label>
  </>
}

function ElementSpecificControls({ element }: Readonly<{ element: SheetElement }>) {
  if (element.type === 'box') return <BoxControls element={element} />

  if (element.type === 'field') return <FieldControls element={element} />

  if (element.type === 'tracker') return <TrackerControls element={element} />

  if (element.type === 'table') return <TableControls element={element} />

  if (element.type === 'text') return <TextControls element={element} />

  return null
}

function ElementControls({ element }: Readonly<{ element: SheetElement }>) {
  function bounds(key: 'x' | 'y' | 'w' | 'h', value: number) {
    if (Number.isNaN(value)) return
    updateElement(element.id, (current) => ({ ...current, [key]: value }))
  }

  return (
    <section className="inspector-section">
      <h2>Selected {element.type}</h2>
      <ElementSpecificControls element={element} />
      {element.type !== 'rule' && element.type !== 'text' && <details className="inspector-disclosure" open><summary>Spacing</summary>
        <NumberField label="Inset" value={element.inset ?? defaultInset} onChange={(inset) => updateElement(element.id, (current) => ({ ...current, inset: Math.max(0, inset) }))} />
        <NumberField label="Padding" value={element.padding ?? defaultPadding} onChange={(padding) => updateElement(element.id, (current) => ({ ...current, padding: Math.max(0, padding) }))} />
        <p className="help">Inset separates borders. Padding sets the space inside.</p>
      </details>}
      <details className="inspector-disclosure" open>
        <summary>Size and position</summary>
        <NumberField label="X" value={element.x} onChange={(value) => bounds('x', value)} />
        <NumberField label="Y" value={element.y} onChange={(value) => bounds('y', value)} />
        <NumberField label="Width" value={element.w} onChange={(value) => bounds('w', value)} />
        {element.type !== 'rule' && <NumberField label="Height" value={element.h} onChange={(value) => bounds('h', value)} />}
        {element.type === 'box' && <NumberField label="Corner cut" value={element.cut} onChange={(cut) => updateElement(element.id, (current) => current.type === 'box' ? { ...current, cut } : current)} />}
        <button className="wide" type="button" onClick={() => updateElement(element.id, (current) => ({ ...current, x: editorStore.state.document.margins.l }))}>Align left</button>
        <button className="wide" type="button" onClick={() => updateElement(element.id, (current) => ({ ...current, x: pageSizes[editorStore.state.document.page].width - editorStore.state.document.margins.r - current.w }))}>Align right</button>
        <button className="wide" type="button" onClick={() => updateElement(element.id, (current) => ({ ...current, x: (pageSizes[editorStore.state.document.page].width - current.w) / 2 }))}>Centre</button>
        <button className="wide" type="button" onClick={() => updateElement(element.id, (current) => ({ ...current, x: editorStore.state.document.margins.l, w: pageSizes[editorStore.state.document.page].width - editorStore.state.document.margins.l - editorStore.state.document.margins.r }))}>Full width</button>
      </details>
    </section>
  )
}

export function Inspector() {
  const state = useStore(editorStore)
  const { document } = state
  const selected = document.els.find((element) => element.id === state.selectedId)
  const selection = new Set(state.selectedIds)

  return (
    <aside className="inspector">
      {selected && state.selectedIds.length === 1 && <ElementControls element={selected} />}
      {state.selectedIds.length > 0 && <section className="inspector-section"><h2>{state.selectedIds.length} selected</h2><div className="arrange-toolbar" role="group" aria-label="Arrange">
        <button type="button" className="icon-btn" title="Duplicate (⌘D)" aria-label="Duplicate" onClick={duplicateSelection}><DuplicateIcon /></button>
        <button type="button" className="icon-btn" title="Bring to front" aria-label="Bring to front" onClick={() => reorderSelection(true)}><FrontIcon /></button>
        <button type="button" className="icon-btn" title="Send to back" aria-label="Send to back" onClick={() => reorderSelection(false)}><BackIcon /></button>
        <button type="button" className="icon-btn" disabled={state.selectedIds.length < 2} title="Group (⌘G)" aria-label="Group" onClick={() => groupSelection()}><GroupIcon /></button>
        <button type="button" className="icon-btn" title="Ungroup (⌘⇧G)" aria-label="Ungroup" onClick={() => groupSelection(true)}><UngroupIcon /></button>
        <span className="divider" />
        <button type="button" className="icon-btn" disabled={state.selectedIds.length < 2} title="Align left" aria-label="Align left" onClick={() => alignSelection('left')}><AlignLeftIcon /></button>
        <button type="button" className="icon-btn" disabled={state.selectedIds.length < 2} title="Align top" aria-label="Align top" onClick={() => alignSelection('top')}><AlignTopIcon /></button>
        <button type="button" className="icon-btn" disabled={state.selectedIds.length < 3} title="Space horizontally" aria-label="Space horizontally" onClick={() => alignSelection('horizontal')}><DistributeHIcon /></button>
        <button type="button" className="icon-btn" disabled={state.selectedIds.length < 3} title="Space vertically" aria-label="Space vertically" onClick={() => alignSelection('vertical')}><DistributeVIcon /></button>
        <span className="divider" />
        <button type="button" className="icon-btn" title="Delete (Del)" aria-label="Delete" onClick={deleteSelected}><DeleteIcon /></button>
      </div></section>}
      <details className="inspector-section" open><summary>Layers</summary><div className="layer-list">{[...document.els].reverse().map((element) => {
        const ToolIcon = toolIcons[element.type === 'rule' ? 'rule' : element.type]
        const label = 'title' in element ? element.title : 'label' in element ? element.label : element.type === 'text' ? element.text : 'Rule'

        return (
          <button key={element.id} type="button" aria-pressed={selection.has(element.id)} className={selection.has(element.id) ? 'active' : ''} onClick={(event) => selectElement(element.id, event.shiftKey)}>
            <ToolIcon />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}{element.groupId ? ' · Group' : ''}</span>
          </button>
        )
      })}</div></details>
      <details className="inspector-section page-setup">
        <summary>View and grid</summary>
        <div className="preset-row">
          <button className={document.snap ? 'active' : ''} type="button" onClick={() => updateDocument((current) => ({ ...current, snap: !current.snap }))}>Snap</button>
          <button className={document.showGrid ? 'active' : ''} type="button" onClick={() => updateDocument((current) => ({ ...current, showGrid: !current.showGrid }))}>Grid</button>
        </div>
        <p className="help">A5 · 24 × 36 grid · {document.grid.toFixed(2)} mm cells</p>
      </details>
    </aside>
  )
}
