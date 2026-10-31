// Renders every document template to print-ready HTML/PDF/PNG so layouts can be inspected as they will print.
// Usage: bun tools/render-templates.tsx <output-dir> [template-id ...]
import { renderToStaticMarkup } from 'react-dom/server'
import { mkdirSync } from 'node:fs'

import { pageSizes } from '../src/editor/model'
import { documentTemplates } from '../src/editor/templates'
import { placePart, sheetParts } from '../src/editor/library'
import { blankDocument } from '../src/editor/model'
import { SheetDefs, SheetElementView } from '../src/editor/sheet-element'

const [outDir, ...only] = process.argv.slice(2)

if (!outDir) throw new Error('Usage: bun tools/render-templates.tsx <output-dir> [template-id ...]')

mkdirSync(outDir, { recursive: true })

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const targets = [
  ...documentTemplates.map((template) => ({ id: template.id, create: template.create })),
  ...sheetParts.map((part) => ({ id: `part-${part.name.toLowerCase().replaceAll(/[^a-z]+/g, '-')}`, create: () => ({ ...structuredClone(blankDocument), els: [placePart(blankDocument, part)] }) })),
]

for (const template of targets) {
  if (only.length && !only.includes(template.id)) continue

  const document = template.create()
  const page = pageSizes[document.page]

  const svg = renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${page.width} ${page.height}`} width={`${page.width}mm`} height={`${page.height}mm`}>
      <SheetDefs />
      <rect width={page.width} height={page.height} fill="white" />
      {document.els.map((element) => <SheetElementView key={element.id} element={element} />)}
    </svg>,
  )

  const html = `<!doctype html><meta charset="utf-8"><style>@page{size:${page.width}mm ${page.height}mm;margin:0}body{margin:0}svg{display:block}</style>${svg}`
  const base = `${outDir}/${template.id}`

  await Bun.write(`${base}.html`, html)
  await Bun.write(`${base}.svg`, svg)
  await Bun.$`${chrome} --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf=${base}.pdf ${base}.html`.quiet()
  await Bun.$`${chrome} --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=3 --window-size=${Math.round(page.width * 3.7795)},${Math.round(page.height * 3.7795)} --screenshot=${base}.png ${base}.html`.quiet()
  console.log(`${template.id} -> ${base}.pdf`)
}
