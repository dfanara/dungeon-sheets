import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { makeElement } from './model'
import { contentBounds, frameBounds, insetBounds, labelLength } from './spacing'
import { SheetElementView } from './sheet-element'
import { createElement } from 'react'

test('adjacent grid allocations have a visible gutter without changing saved geometry', () => {
  const left = makeElement('box', 10, 9, 64, 48)
  const right = makeElement('box', 74, 9, 64, 48)
  const a = frameBounds(left)
  const b = frameBounds(right)

  expect(b.x - a.x - a.w).toBe(2)
  expect(left.x).toBe(10)
  expect(left.w).toBe(64)
  expect(contentBounds(a).x - a.x).toBe(2)
})

test('spacing can be explicitly zero and stays valid on small elements', () => {
  const element = { ...makeElement('field', 10, 9, 5.333, 5.333), inset: 0, padding: 0 }

  expect(contentBounds(frameBounds(element))).toEqual(element)
  const small = insetBounds(element, 100)

  expect(small.w).toBeGreaterThan(0)
  expect(small.h).toBeGreaterThan(0)
  expect(small.x + small.w).toBeLessThanOrEqual(element.x + element.w)
  expect(frameBounds(makeElement('rule', 10, 9, 20, 0)).y).toBe(9)
})

test('long labels are bounded and spacing is embedded in printable SVG', () => {
  const element = { ...makeElement('box', 10, 9, 30, 20), title: 'A LONG SECTION HEADING', inset: 1, padding: 3 }
  const markup = renderToStaticMarkup(createElement('svg', null, createElement(SheetElementView, { element })))

  expect(labelLength('HP', 2.15, 20)).toBeUndefined()
  expect(labelLength('A LONG SECTION HEADING', 2.6, 20)).toBe(20)
  expect(markup).toContain('lengthAdjust="spacingAndGlyphs"')
  expect(markup).toContain('x="14" y="13" width="22" height="12"')
  expect(markup).not.toContain('data-chrome')
})
