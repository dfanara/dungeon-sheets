# AGENTS.md

## Project

Sheetsmith is a local-first, browser-based layout editor for printable tabletop
RPG reference sheets. It combines canvas-speed interaction with exact physical
dimensions, grid consistency, and print-fidelity exports.

The primary use case is a game master creating a consistent collection of
single-page sheets for a physical binder. The editor chrome is a neutral
drafting instrument; the printable sheet is the designed artifact.

## Product Constraints

- Millimetres are the canonical unit. Persist geometry in mm, never pixels.
- The SVG `viewBox` matches the physical page dimensions, so one SVG unit is
  one millimetre.
- Zoom is presentation state only. It must never alter document geometry.
- The origin is the page's top-left, with positive Y moving downward.
- Keep documents single-page until named multi-sheet support is implemented.
- Do not add authentication, cloud persistence, or collaboration.
- Do not add fantasy-themed chrome, parchment textures, decorative fonts, or
  ornament that competes with the printable page.
- Preserve the explicit Save/Load workflow. Do not silently autosave edits.
- Keep all non-printing SVG content marked with `data-chrome` so every export
  can remove it reliably.

Explicit non-goals from the initial specification are multi-page documents,
text reflow, image import, collaborative editing, and fillable form fields.

## Technology

- Runtime and package manager: Bun
- Application framework: TanStack Start with React 19
- Routing: TanStack Router with file-based routes
- Working editor state: TanStack Store
- Persisted browser data: TanStack DB localStorage collections
- Async data infrastructure: TanStack Query
- Validation: Zod
- Build integration: Vite through TanStack Start
- Tests: Bun test
- Linting: Oxlint with the vendored anti-slop plugin

`CLAUDE.md` contains generic Bun guidance that says not to use Vite. This
project is an intentional exception: TanStack Start is configured with Vite.
Continue to use Bun to install packages and invoke scripts, but do not replace
the existing Vite setup unless the user explicitly requests a bundler migration.

## Commands

```bash
bun install
bun run dev
bun test
bun run lint
bun run lint:fix
bun run build
bun run generate-routes
```

Before considering a change complete, run `bun test`, `bun run lint`, and
`bun run build`. The build script includes `tsc --noEmit` and validates both
client and SSR bundles.

## Architecture

- `src/routes/__root.tsx`: document shell and TanStack devtools
- `src/routes/index.tsx`: editor route composition
- `src/router.tsx`: Router and Query SSR integration
- `src/editor/model.ts`: document types, page presets, geometry, and templates
- `src/editor/store.ts`: transient working document and editor UI state
- `src/editor/persistence.ts`: explicit TanStack DB saved-document slot
- `src/editor/canvas.tsx`: SVG canvas and pointer interactions
- `src/editor/sheet-element.tsx`: printable element rendering and selection chrome
- `src/editor/inspector.tsx`: page and contextual element controls
- `src/editor/toolbar.tsx`: drawing tool selection
- `src/editor/keyboard.ts`: keyboard commands
- `src/editor/export.ts`: shared clean-SVG, PNG, and print pipeline
- `src/editor/model.test.ts`: geometry and model tests
- `src/styles.css`: application chrome and responsive layout
- `src/routeTree.gen.ts`: generated; do not edit manually

Keep geometry and document transformations in model/store modules rather than
embedding them in controls. Keep printable rendering in SVG components and
application chrome in HTML/CSS where practical.

## Document Model

`SheetDocument` owns:

- page preset
- top, right, bottom, and left margins in mm
- grid size in mm
- snapping and grid visibility
- elements in paint order, bottom to top

All elements have `id`, `type`, `x`, `y`, `w`, and `h`. Supported element types
are `box`, `field`, `text`, and `rule`. IDs are seven-character base-36 strings.
Array order is paint order; do not introduce a second z-index field.

Optional `groupId` links elements for selection and arrangement. Undo/redo history
is transient store state; pointer gestures produce one history entry.

Component bounds are grid allocations. `inset` moves printable borders inward
(default 1 mm per side); `padding` reserves interior space (default 2 mm).
`src/editor/spacing.ts` derives frame/content bounds without mutating geometry.
Rules and standalone text have no default inset. Zero spacing is supported.

Page presets:

| Preset | Width | Height |
| --- | ---: | ---: |
| A5 | 148 mm | 210 mm |
| A4 | 210 mm | 297 mm |
| HALF | 139.7 mm | 215.9 mm |
| LETTER | 215.9 mm | 279.4 mm |

Default A5 values use a 5.333... mm snap step and margins of 9 mm top/bottom and
10 mm left/right. The resulting content area has a 24 by 36 grid, and snapping
is anchored to those exact cell boundaries. The 24-column grid divides evenly
into halves, thirds, and quarters.

## Geometry Rules

- With snapping enabled: `round(value / grid) * grid`.
- With snapping disabled: round to 0.01 mm.
- Apply snapping to creation, movement, resizing, and keyboard nudging.
- Numeric inspector input is authoritative and may intentionally be off-grid.
- Pointer conversion is `(client coordinate - SVG rect origin) / zoom`.
- Minimum resized dimensions are one grid unit.
- Rules have two horizontal handles and ignore height.
- Other elements have eight directional resize handles.
- New drawing operations return to Select and select the new element.

The signature box uses two concentric clipped-corner paths. Preserve millimetre
stroke widths and parallel chamfers. Titles use a white `paint-order: stroke`
knockout rather than a measured backing rectangle.

## State And Persistence

The editable working document belongs in TanStack Store. The localStorage-backed
TanStack DB collection is the explicit saved snapshot, not the live editing
state. Save writes or replaces the `current` entry; Load replaces the working
document. Storage failures should become a status message, not crash the app.

Browser-only APIs must only run from event handlers, effects, or otherwise
client-safe code. Module initialization must remain SSR-safe.

## Export Rules

SVG, PNG, and Print must share `buildSvg()` so output cannot drift:

- clone the live SVG
- remove every `[data-chrome]` node
- set physical `width` and `height` attributes in mm
- serialize as standalone SVG
- rasterize PNG at 300 DPI over a white background
- print with zero browser page margin and exact physical page size

Any printable style required by exported SVG must be embedded in the SVG, not
depend solely on application CSS.

## UI Language

- Workspace: `#191B1E`
- Panels: `#212427`
- Dividers: `#31363B`
- Primary text: `#DCD9D3`
- Dim text: `#8A8E93` and `#63676B`
- Active/selected state: `#C9A227`
- Margin guides: `#7FB2E5`
- Grid guides: `#E8EEF3`, major lines `#C8D4DE`

Use Inter or the system sans-serif stack for chrome. Keep controls compact,
word-labelled, and icon-free. Gold indicates active or selected state; blue is
reserved for non-printing guides. The page is the only light surface.

Desktop uses a compact horizontal tool strip, fluid workspace, and optional properties dock. Templates and components open on demand. Preserve
usable responsive behavior for narrow screens even though desktop is the main
editing environment.

## Engineering Conventions

- Prefer the smallest correct change and existing modules over parallel systems.
- Keep strict TypeScript and discriminated unions intact; avoid broad casts.
- Do not suppress anti-slop lint rules. Restructure code to satisfy them.
- Add tests for geometry, snapping, document transformations, and export cleanup.
- Avoid storing derived values or render-only values in `SheetDocument`.
- Do not edit generated route files.
- Use `#/` for source-root imports and relative imports within one feature folder.
- Keep files below the configured 400-line lint limit.

## Current Gaps

The current implementation is a functional prototype, not the full roadmap.
Known gaps include named multi-sheet sets, user-saved reusable element libraries,
text wrapping, guide rulers, element-edge
snapping, and full hex-grid rendering. Do not add compatibility shims for these;
implement them deliberately when requested.
