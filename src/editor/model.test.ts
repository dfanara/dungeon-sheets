import { describe, expect, test } from 'bun:test'

import { blankDocument, chamferPath, characterDocument, documentTemplates, locationDocument, makeElement, npcDocument, partyDocument, round, roundPosition, sessionDocument } from './model'

describe('editor geometry', () => {
  test('snaps values to the document grid', () => {
    expect(round(5.9, blankDocument)).toBeCloseTo(16 / 3)
    expect(round(3.7, { ...blankDocument, snap: false })).toBe(3.7)
    expect(roundPosition(17.1, blankDocument, 'x')).toBeCloseTo(46 / 3)
    expect(roundPosition(17.1, blankDocument, 'y')).toBeCloseTo(59 / 3)
  })

  test('clamps chamfers to small bounds', () => {
    expect(chamferPath(0, 0, 2, 4, 8)).toStartWith('M 1,0')
  })

  test('creates field elements with canonical millimetre bounds', () => {
    const field = makeElement('field', 9, 12, 57, 8.5)

    expect(field).toMatchObject({ type: 'field', x: 9, y: 12, w: 57, h: 8.5 })
    expect(field.id).toHaveLength(7)
  })

  test('creates generic character-sheet primitives', () => {
    expect(makeElement('value', 10, 9, 16, 16)).toMatchObject({ type: 'field', variant: 'box', label: 'VALUE' })
    expect(makeElement('tracker', 10, 9, 32, 16)).toMatchObject({ type: 'tracker', count: 6, columns: 6, marker: 'circle' })
    expect(makeElement('table', 10, 9, 64, 48)).toMatchObject({ type: 'table', rows: 5, headers: ['NAME', 'VALUE', 'NOTES'] })
  })

  test('uses a 24 by 36 A5 content grid', () => {
    expect((148 - blankDocument.margins.l - blankDocument.margins.r) / blankDocument.grid).toBe(24)
    expect((210 - blankDocument.margins.t - blankDocument.margins.b) / blankDocument.grid).toBe(36)
  })

  test('builds grid-aligned DM templates', () => {
    expect(locationDocument().els).toHaveLength(13)
    expect(npcDocument().els).toHaveLength(13)
    expect(sessionDocument().els).toHaveLength(9)
    expect(partyDocument().els).toHaveLength(35)
    expect(characterDocument().els).toHaveLength(24)
    expect(documentTemplates).toHaveLength(6)
    expect(npcDocument().els[0]).toMatchObject({ type: 'box', title: 'NPC', x: 10, y: 9, w: 128, h: 32 })

    for (const template of documentTemplates) {
      for (const element of template.create().els) {
        expect((element.x - blankDocument.margins.l) / blankDocument.grid).toBeCloseTo(Math.round((element.x - blankDocument.margins.l) / blankDocument.grid))
        expect((element.y - blankDocument.margins.t) / blankDocument.grid).toBeCloseTo(Math.round((element.y - blankDocument.margins.t) / blankDocument.grid))
        expect(element.w / blankDocument.grid).toBeCloseTo(Math.round(element.w / blankDocument.grid))
        expect(element.x + element.w).toBeLessThanOrEqual(148 - blankDocument.margins.r + .001)
        expect(element.y + element.h).toBeLessThanOrEqual(210 - blankDocument.margins.b + .001)
      }
    }
  })
})
