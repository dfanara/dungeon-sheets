import { expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { blankDocument } from './model'
import { characterSummary } from './summary-part'
import { SheetElementView } from './sheet-element'

test('summary is an independently grouped, grid-aligned composition in paint order', () => {
  const elements = characterSummary(blankDocument)!
  const other = characterSummary(blankDocument)!

  expect(elements).toHaveLength(15)
  expect(new Set(elements.map((element) => element.groupId)).size).toBe(1)
  expect(elements[0]!.groupId).not.toBe(other[0]!.groupId)
  expect(elements[0]!.type).toBe('box')
  expect(new Set(elements.map((element) => element.id)).size).toBe(15)

  for (const element of elements) {
    expect((element.x - 10) / blankDocument.grid).toBeCloseTo(Math.round((element.x - 10) / blankDocument.grid))
    expect(element.x + element.w).toBeLessThanOrEqual(138.0001)
    expect(element.y + element.h).toBeLessThanOrEqual(73.0001)
  }

  expect(blankDocument.els).toHaveLength(0)
  expect(characterSummary({ ...blankDocument, els: [{ ...elements[0]!, h: 192 }] })).toHaveLength(15)
})

test('fantasy variants render as standalone SVG geometry', () => {
  const elements = characterSummary(blankDocument)!
  const markup = renderToStaticMarkup(createElement('svg', null, elements.map((element) => createElement(SheetElementView, { key: element.id, element }))))

  expect(markup).toContain('CHARACTER')
  expect(markup).toContain('PERCEPTION')
  expect(markup).toContain('SPECIAL ITEMS')
  expect(markup).toContain('<circle')
  expect(markup).not.toContain('NaN')
  expect(markup).not.toContain('data-chrome')
})
