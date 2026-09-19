# Design

<!-- impeccable:design-schema 1 -->

## World

A precision technical instrument, not a generic dark design-tool clone. Neutral graphite grayscale chrome with exactly one reserved signal color (amber) that means "active / selected" and nothing else — it never decorates. Every numeric field reads in tabular monospace so dimensions and counts line up and scan fast, the way a spec sheet or drafting tool's measurements would. Hairline 1px rules are the only dividers; there are no shadows in the chrome except the sheet page's own drop shadow, which represents an actual sheet of paper sitting on the desk.

## Palette

- `--bg: #131417` — canvas/workspace ground
- `--surface: #1a1c20` — chrome (topbar, tool rail, inspector, docked panels)
- `--surface-2: #212327` — raised/hover surface
- `--surface-3: #292c31` — active-hover / grid dots on workspace
- `--border: #34373d` — hairline dividers
- `--border-strong: #4a4e55` — hover borders, panel edges
- `--ink: #e7e5e1` — primary text
- `--ink-dim: #93969c` — secondary text, labels, inactive icons
- `--ink-faint: #5c5f66` — tertiary text, section eyebrows, disabled
- `--signal: #e2a53c` — the one reserved accent: active tool, active toggle, selection handles, marquee, layer-active dot. Never used decoratively.
- `--signal-ink: #191a1d` — text/icon color on top of `--signal`
- `--danger: #d9705a` — reserved, not yet used in chrome (available for future destructive/error states)
- `--mono`: `ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace` — every dimension (x/y/w/h, mm), count, and zoom % field

The print sheet itself stays pure white — that is real paper, outside this chrome system, and is never restyled.

## Type

- UI face: Inter / system-ui stack, 11.5px base, unchanged from before.
- Section labels and the wordmark: uppercase, `letter-spacing: .11em–.14em`, 600 weight, `--ink-faint` or `--ink-dim` — an "instrument label" register, used sparingly (section headers, dock headers, brand mark only).
- All measured values (dimensions, counts, zoom, page size) render in `--mono` with `font-variant-numeric: tabular-nums`, right-aligned in their input.

## Components

- **Icon buttons** (`.icon-btn`): 30×30px square, centered 15×15 stroke icon (`icons.tsx`), `--ink-dim` at rest, `--ink` on hover, `--signal`/`--signal-ink` when active/pressed. Used across the top bar, tool rail, and inspector arrange toolbar. Every icon-only button carries a `title` (tooltip) and `aria-label`.
- **Icon set** (`src/editor/icons.tsx`): a single authored 20×20 stroke library (1.5px stroke, round joins/caps) — tool glyphs (select/box/field/value/tracker/table/text/rule), action glyphs (undo/redo/fit/eye/panel/save/load/export), and arrange glyphs (duplicate/front/back/group/ungroup/delete/align/distribute). One consistent stroke weight throughout; no emoji or Unicode glyphs stand in for icons.
- **Docked panels** (`.dock-panel` + `.dock-scrim`): Components and Layouts open as panels that slide in from the tool rail's left edge and cover the workspace, instead of the native `popover` floating menu used before. Dismissed by the close button, the scrim, or Escape. On narrow viewports (≤600px) the same panel docks to the bottom third of the screen instead of the left edge. Export still uses the native `popover` (`.export-popover`) since it's a small, anchored action menu, not a working panel.
- **Arrange toolbar** (`.arrange-toolbar`): the inspector's duplicate/order/group/align/distribute/delete actions are a single icon-button row with tooltips and a divider between action groups, replacing the previous grid of text buttons.
- **Layer list**: each row now carries the element's tool icon plus an amber dot on the active row, instead of a plain text button.
- **Numeric field** (`.number-input`): right-aligned tabular-mono value with a dim unit suffix (`mm`), unchanged structurally but restyled into the mono/tabular system.

## Layout

Unchanged grid: 44px top bar / 40px tool rail / flexible workspace+inspector (268px). Mobile (≤600px) stacks the shell as topbar → tool rail → workspace → inspector, in that explicit order (`order` in CSS), rather than DOM order, so the page title/status stays above the tools on narrow screens.

## Motion

Docked panels slide in with an 8px translate + fade over 120ms ease-out (`dock-in` keyframe) — the one authored entrance in the system. Everything else (hover, active state) is an instant color/border transition (~100ms), consistent with an instrument's toggle rather than a decorative flourish.

## What stays untouched

- The print sheet canvas (paper white, grid, element rendering, print output) — product truth, must remain print-accurate.
- All interaction logic: drag/resize/marquee select, undo/redo, keyboard shortcuts, save/load/export, template/component insertion.
- Copy and labels, except the top-bar name corrected from a leftover "Sheetsmith" to "Dungeon Sheets" (per PRODUCT.md) and the page/size readout format.
