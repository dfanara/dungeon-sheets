import type { BoxElement, FieldElement, SheetElement, TableElement, TrackerElement } from './model'
import { chamferPath } from './model'
import { contentBounds, frameBounds, labelLength, splitCells } from './spacing'
import { FantasyField } from './fantasy-element'

function FieldView({ element }: Readonly<{ element: FieldElement }>) {
  const variant = element.variant ?? 'line'

  if (variant === 'shield' || variant === 'banner' || variant === 'attached') return <FantasyField element={element} />

  const content = contentBounds(element)
  const labelY = content.y + content.h - .5
  const labelWidth = variant === 'circle' ? Math.min(content.w, content.h) : content.w

  if (variant === 'circle') {
    const radius = Math.max(1, Math.min(element.w, element.h) / 2 - .5)

    return (
      <g data-element-id={element.id}>
        <circle cx={element.x + element.w / 2} cy={element.y + element.h / 2} r={radius} fill="white" stroke="#111" strokeWidth=".35" />
        <text className="value-label" x={element.x + element.w / 2} y={labelY} textAnchor="middle" textLength={labelLength(element.label, 2.15, labelWidth)} lengthAdjust="spacingAndGlyphs">{element.label}</text>
      </g>
    )
  }

  if (variant === 'box') {
    return (
      <g data-element-id={element.id}>
        <path d={chamferPath(element.x, element.y, element.w, element.h, 1.5)} fill="white" stroke="#111" strokeWidth=".35" />
        <path d={chamferPath(element.x + .7, element.y + .7, element.w - 1.4, element.h - 1.4, .8)} fill="none" stroke="#777" strokeWidth=".12" />
        <text className="value-label" x={element.x + element.w / 2} y={labelY} textAnchor="middle" textLength={labelLength(element.label, 2.15, labelWidth)} lengthAdjust="spacingAndGlyphs">{element.label}</text>
      </g>
    )
  }

  const labels = element.labels?.length ? element.labels : [element.label]

  return (
    <g data-element-id={element.id}>
      {splitCells(content, labels.length).map((cell, index) => (
        <g key={`${cell.x}-${labels[index]}`}>
          <line x1={cell.x} y1={content.y + content.h} x2={cell.x + cell.w} y2={content.y + content.h} stroke="#222" strokeWidth=".25" />
          <text className="field-label" x={cell.x} y={labelY - .6} textLength={labelLength(labels[index]!, 2.3, cell.w)} lengthAdjust="spacingAndGlyphs">{labels[index]}</text>
        </g>
      ))}
    </g>
  )
}

function TrackerView({ element }: Readonly<{ element: TrackerElement }>) {
  element = contentBounds(element)
  const count = Math.max(1, Math.round(element.count))
  const columns = Math.max(1, Math.min(count, Math.round(element.columns)))
  const rows = Math.ceil(count / columns)
  const cellWidth = element.w / columns
  const markerTop = element.y + 3.6
  const cellHeight = Math.max(1, (element.h - 3.6) / rows)
  const markerSize = Math.max(.7, Math.min(cellWidth, cellHeight) * .28)

  return (
    <g data-element-id={element.id}>
      <text className="module-label" x={element.x} y={element.y + 2.5} textLength={labelLength(element.label, 2.15, element.w)} lengthAdjust="spacingAndGlyphs">{element.label}</text>
      {Array.from({ length: count }, (_, index) => {
        const cx = element.x + (index % columns + .5) * cellWidth
        const cy = markerTop + (Math.floor(index / columns) + .5) * cellHeight

        return element.marker === 'circle'
          ? <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={markerSize} fill="white" stroke="#111" strokeWidth=".3" />
          : <rect key={`${cx}-${cy}`} x={cx - markerSize} y={cy - markerSize} width={markerSize * 2} height={markerSize * 2} fill="white" stroke="#111" strokeWidth=".3" />
      })}
    </g>
  )
}

function TableView({ element }: Readonly<{ element: TableElement }>) {
  const content = contentBounds(element)
  const rowCount = Math.max(1, Math.round(element.rows))
  const headerHeight = Math.min(4.5, content.h / 2)
  const bodyTop = content.y + headerHeight
  const rowHeight = (content.h - headerHeight) / rowCount
  const columnWidth = content.w / Math.max(1, element.headers.length)

  return (
    <g data-element-id={element.id}>
      <path d={chamferPath(element.x, element.y, element.w, element.h, 2)} fill="white" stroke="#111" strokeWidth=".35" />
      <line x1={content.x} y1={bodyTop} x2={content.x + content.w} y2={bodyTop} stroke="#111" strokeWidth=".25" />
      {element.headers.slice(1).map((_, index) => {
        const x = content.x + (index + 1) * columnWidth

        return <line key={x} x1={x} y1={content.y} x2={x} y2={content.y + content.h} stroke="#777" strokeWidth=".16" />
      })}
      {Array.from({ length: rowCount - 1 }, (_, index) => {
        const y = bodyTop + (index + 1) * rowHeight

        return <line key={y} x1={content.x} y1={y} x2={content.x + content.w} y2={y} stroke="#aaa" strokeWidth=".12" />
      })}
      {element.headers.map((header, index) => <text key={`${header}-${content.x + index * columnWidth}`} className="table-header" x={content.x + (index + .5) * columnWidth} y={content.y + headerHeight * .75} textAnchor="middle" textLength={labelLength(header, 2.15, Math.max(.5, columnWidth - 2))} lengthAdjust="spacingAndGlyphs">{header}</text>)}
      <text className="sheet-title" x={element.x + element.w / 2} y={element.y + 1.2} textAnchor="middle" textLength={labelLength(element.title, 2.6, content.w - 4)} lengthAdjust="spacingAndGlyphs">{element.title}</text>
    </g>
  )
}

function BoxView({ element }: Readonly<{ element: BoxElement }>) {
    const inset = Math.min(.7, element.w / 8, element.h / 8)
    const fillId = `fill-lines-${element.id}`
    const content = contentBounds(element)
    const innerPath = chamferPath(element.x + inset, element.y + inset, element.w - inset * 2, element.h - inset * 2, Math.max(0, element.cut - inset * (2 - Math.SQRT2)))

    if (element.treatment === 'backplate' || element.treatment === 'strip') return <g data-element-id={element.id}>
      <path d={chamferPath(element.x, element.y, element.w, element.h, element.cut)} fill={element.treatment === 'strip' ? '#d9d9d9' : '#ededeb'} />
      {element.title && <text className="module-label" x={content.x} y={content.y + Math.min(2.5, content.h)} textLength={labelLength(element.title, 2.15, content.w)} lengthAdjust="spacingAndGlyphs">{element.title}</text>}
    </g>

    const fill = element.fill === 'none' || element.fill === 'hex'
      ? 'white'
      : element.fill === 'lines' ? `url(#${fillId})` : `url(#fill-${element.fill})`

    return (
      <g data-element-id={element.id}>
        {element.fill === 'lines' && <defs><pattern id={fillId} width={element.gridSize} height={element.gridSize} patternUnits="userSpaceOnUse"><path d={`M 0 ${element.gridSize} H ${element.gridSize}`} stroke="#c7c7c7" strokeWidth=".12" /></pattern></defs>}
        <defs><clipPath id={`content-${element.id}`}><path d={innerPath} /></clipPath></defs>
        <path d={chamferPath(element.x, element.y, element.w, element.h, element.cut)} fill="white" stroke="#111" strokeWidth=".35" />
        <rect x={content.x} y={content.y} width={content.w} height={Math.max(0, content.h - (element.caption === 'bottom' ? 3 : 0))} fill={fill} clipPath={`url(#content-${element.id})`} />
        <path
          d={innerPath}
          fill="none"
          stroke="#111"
          strokeWidth=".18"
        />
        <text className="sheet-title" x={element.x + element.w / 2} y={element.caption === 'bottom' ? element.y + element.h - 1.2 : element.y + 1.2} textAnchor="middle" textLength={labelLength(element.title, 2.6, Math.min(content.w, element.w - element.cut * 2) - 2)} lengthAdjust="spacingAndGlyphs">
          {element.title}
        </text>
      </g>
    )
}

export function SheetElementView({ element }: Readonly<{ element: SheetElement }>) {
  element = frameBounds(element)

  if (element.type === 'box') return <BoxView element={element} />

  if (element.type === 'field') {
    return <FieldView element={element} />
  }

  if (element.type === 'rule') {
    return <line data-element-id={element.id} x1={element.x} y1={element.y} x2={element.x + element.w} y2={element.y} stroke="#111" strokeWidth=".3" />
  }

  if (element.type === 'tracker') return <TrackerView element={element} />

  if (element.type === 'table') return <TableView element={element} />

  const anchorX = element.align === 'start' ? element.x : element.align === 'middle' ? element.x + element.w / 2 : element.x + element.w

  return (
    <text
      data-element-id={element.id}
      x={anchorX}
      y={element.y + element.size}
      fill={element.color}
      fontSize={element.size}
      fontWeight={element.weight}
      textAnchor={element.align}
    >
      {element.text}
    </text>
  )
}

export function Selection({ element, handles = true }: Readonly<{ element: SheetElement; handles?: boolean }>) {
  const height = element.type === 'rule' ? 0 : element.h
  const content = contentBounds(frameBounds(element))

  const points: Array<[string, number, number]> = element.type === 'rule'
    ? [['w', element.x, element.y], ['e', element.x + element.w, element.y]]
    : [
        ['nw', element.x, element.y],
        ['n', element.x + element.w / 2, element.y],
        ['ne', element.x + element.w, element.y],
        ['w', element.x, element.y + height / 2],
        ['e', element.x + element.w, element.y + height / 2],
        ['sw', element.x, element.y + height],
        ['s', element.x + element.w / 2, element.y + height],
        ['se', element.x + element.w, element.y + height],
      ]

  return (
    <g data-chrome="selection">
      <rect x={element.x} y={element.y} width={element.w} height={height || .2} fill="none" stroke="#e2a53c" strokeWidth=".35" pointerEvents="none" />
      {handles && element.type !== 'rule' && element.type !== 'text' && <rect x={content.x} y={content.y} width={content.w} height={content.h} fill="none" stroke="#7fb2e5" strokeWidth=".15" strokeDasharray=".6 .6" pointerEvents="none" />}
      {handles && points.map(([handle, x, y]) => <rect key={handle} data-handle={handle} x={x - .85} y={y - .85} width="1.7" height="1.7" fill="#e2a53c" stroke="white" strokeWidth=".3" />)}
    </g>
  )
}
