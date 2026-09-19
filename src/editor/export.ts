import { z } from 'zod'

import { blankDocument, pageSizes, type SheetDocument, type SheetElement } from './model'

const fileFormat = 'dungeon-sheets'

const fileVersion = 1

const sheetDocumentSchema = z.object({
  page: z.enum(['A5', 'A4', 'HALF', 'LETTER']),
  margins: z.object({ t: z.number(), r: z.number(), b: z.number(), l: z.number() }),
  grid: z.number(),
  snap: z.boolean(),
  showGrid: z.boolean(),
  els: z.array(z.custom<SheetElement>()),
}) satisfies z.ZodType<SheetDocument, unknown>

const sheetFileSchema = z.object({
  format: z.string().optional(),
  version: z.number().optional(),
  name: z.string().optional(),
  document: sheetDocumentSchema,
}).loose()

function slug(name: string) {
  const cleaned = name.trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-+|-+$/g, '')

  return cleaned || 'sheet'
}

export function buildSvg(document: SheetDocument) {
  const source = window.document.querySelector<SVGSVGElement>('#sheet-canvas')

  if (!source) throw new Error('Sheet canvas is not available')

  const clone = source.cloneNode(true)

  if (!(clone instanceof SVGSVGElement)) throw new Error('Could not clone the sheet')

  const page = pageSizes[document.page]

  clone.querySelectorAll('[data-chrome]').forEach((node) => node.remove())
  clone.removeAttribute('class')
  clone.removeAttribute('style')
  clone.setAttribute('width', `${page.width}mm`)
  clone.setAttribute('height', `${page.height}mm`)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportSvg(document: SheetDocument) {
  download(new Blob([buildSvg(document)], { type: 'image/svg+xml' }), 'sheetsmith.svg')
}

export async function exportPng(document: SheetDocument) {
  const page = pageSizes[document.page]
  const scale = 300 / 25.4
  const canvas = window.document.createElement('canvas')
  const image = new Image()
  const svgUrl = URL.createObjectURL(new Blob([buildSvg(document)], { type: 'image/svg+xml' }))

  canvas.width = Math.round(page.width * scale)
  canvas.height = Math.round(page.height * scale)
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Could not rasterise the sheet'))
    image.src = svgUrl
  })
  const context = canvas.getContext('2d')

  if (!context) throw new Error('Canvas is not available')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(svgUrl)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))

  if (!blob) throw new Error('Could not create PNG')
  download(blob, 'sheetsmith.png')
}

export function exportSheetFile(document: SheetDocument, name: string) {
  const payload = { format: fileFormat, version: fileVersion, name, document }

  download(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `${slug(name)}.json`)
}

export function readSheetFile(file: File): Promise<{ name: string; document: SheetDocument }> {
  return file.text().then((text) => {
    const fallbackName = file.name.replace(/\.json$/i, '') || 'Imported sheet'
    let parsed: unknown

    try {
      parsed = JSON.parse(text)
    } catch {
      throw new Error('Not a valid Dungeon Sheets file')
    }

    const wrapped = sheetFileSchema.safeParse(parsed)

    if (wrapped.success) {
      const document = { ...structuredClone(blankDocument), ...wrapped.data.document }

      return { name: wrapped.data.name?.trim() || fallbackName, document }
    }

    const bare = sheetDocumentSchema.safeParse(parsed)

    if (bare.success) return { name: fallbackName, document: { ...structuredClone(blankDocument), ...bare.data } }

    throw new Error('Not a valid Dungeon Sheets file')
  })
}

export function printSheet(document: SheetDocument) {
  const page = pageSizes[document.page]
  const popup = window.open('', '_blank')

  if (!popup) throw new Error('Pop-up blocked')

  popup.document.write(`<style>@page{size:${page.width}mm ${page.height}mm;margin:0}body{margin:0}</style>${buildSvg(document)}<script>print()</script>`)
  popup.document.close()
}
