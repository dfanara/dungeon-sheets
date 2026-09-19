import { chamferPath, type FieldElement } from './model'
import { contentBounds, labelLength } from './spacing'

function shieldPath(x: number, y: number, w: number, h: number) {
  return `M ${x + w / 2} ${y} L ${x + w * .94} ${y + h * .14} Q ${x + w} ${y + h * .7} ${x + w / 2} ${y + h} Q ${x} ${y + h * .7} ${x + w * .06} ${y + h * .14} Z`
}

function bannerPath(x: number, y: number, w: number, h: number) {
  return `M ${x} ${y + h * .1} C ${x + w * .35} ${y - h * .2} ${x + w * .65} ${y + h * .4} ${x + w} ${y + h * .1} L ${x + w * .98} ${y + h * .5} L ${x + w} ${y + h * .9} C ${x + w * .65} ${y + h * 1.2} ${x + w * .35} ${y + h * .6} ${x} ${y + h * .9} Z`
}

export function FantasyField({ element }: Readonly<{ element: FieldElement }>) {
  const content = contentBounds(element)
  const label = (x: number, y: number, width: number) => <text className="value-label" x={x} y={y} textAnchor="middle" textLength={labelLength(element.label, 2.15, width)} lengthAdjust="spacingAndGlyphs">{element.label}</text>

  if (element.variant === 'attached') {
    const diameter = Math.min(element.h, element.w * .38)
    const labelX = element.x + diameter + (element.w - diameter) / 2

    return <g data-element-id={element.id}>
      <path d={chamferPath(element.x + diameter / 2, element.y + element.h * .13, element.w - diameter / 2, element.h * .74, 1.5)} fill="white" stroke="#111" strokeWidth=".35" />
      <circle cx={element.x + diameter / 2} cy={element.y + element.h / 2} r={Math.max(.1, diameter / 2 - .2)} fill="white" stroke="#111" strokeWidth=".45" />
      <circle cx={element.x + diameter / 2} cy={element.y + element.h / 2} r={Math.max(.1, diameter / 2 - .9)} fill="none" stroke="#111" strokeWidth=".15" />
      {label(labelX, element.y + element.h / 2 + .75, element.w - diameter - 3)}
    </g>
  }

  if (element.variant === 'banner') {
    const height = element.h * .95

    return <g data-element-id={element.id}>
      <path d={`M ${element.x + 2} ${element.y + height * .4} L ${element.x} ${element.y + height * .4} L ${element.x + 1} ${element.y + height * .75} L ${element.x} ${element.y + height} L ${element.x + 5} ${element.y + height * .9} Z`} fill="#e5e5e5" stroke="#111" strokeWidth=".3" />
      <path d={bannerPath(element.x + 2, element.y, Math.max(.1, element.w - 2), height)} fill="white" stroke="#111" strokeWidth=".4" />
      <path d={bannerPath(element.x + 2.7, element.y + .6, Math.max(.1, element.w - 3.4), Math.max(.1, height - 1.2))} fill="none" stroke="#111" strokeWidth=".15" />
      <text className="value-label" x={element.x + 6} y={element.y + height * .84} textLength={labelLength(element.label, 2.15, Math.max(.1, content.w - 8))} lengthAdjust="spacingAndGlyphs">{element.label}</text>
    </g>
  }

  return <g data-element-id={element.id}>
    <path d={shieldPath(element.x, element.y, element.w, element.h)} fill="white" stroke="#111" strokeWidth=".4" />
    <path d={shieldPath(element.x + .7, element.y + .7, Math.max(.1, element.w - 1.4), Math.max(.1, element.h - 1.4))} fill="none" stroke="#111" strokeWidth=".15" />
    {label(element.x + element.w / 2, element.y + element.h * .73, content.w * .7)}
  </g>
}
