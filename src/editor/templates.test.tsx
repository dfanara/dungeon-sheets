import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { blankDocument, pageSizes } from './model'
import { placePart, sheetParts } from './library'
import { SheetElementView } from './sheet-element'
import { contentBounds, frameBounds, rulePitch, tableLayout } from './spacing'
import { documentTemplates } from './templates'

const prepTemplates = documentTemplates.filter((template) => ['Prep', 'Play', 'Campaign'].includes(template.group))

const { margins, grid } = blankDocument

describe('prep templates', () => {
  test('ship the 5-by-5 and lazy prep sheets', () => {
    expect(prepTemplates.map((template) => template.id)).toEqual(['set', 'session-plan', 'prep', 'five-minute', 'run', 'after', 'arc', 'campaign'])
    expect(new Set(documentTemplates.map((template) => template.id)).size).toBe(documentTemplates.length)
  })

  for (const template of prepTemplates) {
    const document = template.create()
    const page = pageSizes[document.page]

    describe(template.id, () => {
      test('is A5 and every element sits inside the margins on the grid', () => {
        expect(document.page).toBe('A5')

        for (const element of document.els) {
          if (element.type === 'text') continue

          const halves = (element.x - margins.l) / grid * 2

          // Trackers are overlays placed inside a backing panel, so only they may sit between grid lines.
          if (element.type !== 'tracker') expect(Math.abs(halves - Math.round(halves))).toBeLessThan(.001)
          expect(element.x).toBeGreaterThanOrEqual(margins.l - .001)
          expect(element.y).toBeGreaterThanOrEqual(margins.t - .001)
          expect(element.x + element.w).toBeLessThanOrEqual(page.width - margins.r + .001)
          expect(element.y + element.h).toBeLessThanOrEqual(page.height - margins.b + .001)
        }
      })

      test('has no partially overlapping frames', () => {
        const frames = document.els.filter((element) => element.type !== 'text' && element.type !== 'rule').map(frameBounds)

        for (const [index, a] of frames.entries()) {
          for (const b of frames.slice(index + 1)) {
            const overlaps = a.x < b.x + b.w - .01 && b.x < a.x + a.w - .01 && a.y < b.y + b.h - .01 && b.y < a.y + a.h - .01
            const contains = (outer: typeof a, inner: typeof a) => outer.x <= inner.x + .01 && outer.y <= inner.y + .01 && outer.x + outer.w >= inner.x + inner.w - .01 && outer.y + outer.h >= inner.y + inner.h - .01

            if (overlaps) expect(contains(a, b) || contains(b, a)).toBe(true)
          }
        }
      })

      test('never compresses or stretches a label to make it fit', () => {
        for (const element of document.els) expect(renderToStaticMarkup(<svg><SheetElementView element={element} /></svg>)).not.toContain('textLength')
      })

      test('keeps headings clear of the fields beside them', () => {
        const title = document.els.find((element) => element.type === 'text' && element.size > 4)
        const firstField = document.els.find((element) => element.type === 'field')

        if (title?.type !== 'text' || !firstField) return

        expect(title.x + title.text.length * title.size * .72).toBeLessThan(firstField.x)
      })

      test('table rows leave room to write by hand', () => {
        for (const element of document.els) {
          if (element.type !== 'table') continue

          const body = element.rows * (element.lines ?? 1)
          const content = frameBounds(element)

          expect((content.h - 4.2) / (body + 0)).toBeGreaterThanOrEqual(4.3)
        }
      })
    })
  }
})

describe('library parts', () => {
  for (const part of sheetParts) {
    test(`${part.name} renders without squeezing labels or crowding its headings`, () => {
      const element = placePart(blankDocument, part)

      expect(renderToStaticMarkup(<svg><SheetElementView element={element} /></svg>)).not.toContain('textLength')

      if (element.type === 'table' && element.treatment === 'panel') {
        const layout = tableLayout(element, contentBounds(frameBounds(element)).h)

        expect(layout.pitch).toBeCloseTo(rulePitch, 1)

        if (layout.headBand) expect(layout.headBand).toBeGreaterThanOrEqual(3.5)
      }
    })
  }
})
