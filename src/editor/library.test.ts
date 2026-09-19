import { expect, test } from 'bun:test'
import { blankDocument } from './model'
import { placePart, sheetParts } from './library'

test('library placement finds unoccupied grid cells without changing the document', () => {
  const first = placePart(blankDocument, sheetParts[1])!
  const document = { ...blankDocument, els: [first] }
  const next = placePart(document, sheetParts[1])!

  expect(first.x).toBe(blankDocument.margins.l)
  expect(next.x).toBeCloseTo(first.x + first.w)
  expect(next.y).toBe(first.y)
  expect(document.els).toHaveLength(1)
})

test('library keeps adding on top when the page is full', () => {
  const occupied = { ...placePart(blankDocument, sheetParts[0])!, w: 128, h: 192 }

  const document = { ...blankDocument, els: [occupied] }

  for (let index = 0; index < 20; index += 1) {
    const element = placePart(document, sheetParts[1])

    expect(element.x).toBe(blankDocument.margins.l)
    expect(element.y).toBe(blankDocument.margins.t)
    document.els.push(element)
  }

  expect(document.els).toHaveLength(21)
  expect(new Set(document.els.map((element) => element.id)).size).toBe(21)
})
