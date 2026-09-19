---
version: 1
slug: "src-routes-index-tsx"
primary_target: "src/routes/index.tsx"
related_targets: ["src/styles.css","src/editor/toolbar.tsx","src/editor/topbar.tsx","src/editor/inspector.tsx"]
---

## Direction contract

THESIS: The editor reads as a precision instrument for laying out print sheets, not a generic dark design-tool clone; it refuses ornament, brand color, and stock "app chrome" in favor of a system where every mark on screen means something measurable.

OWN-WORLD: Neutral graphite grayscale (near-black ground, mid-gray chrome, off-white ink) with exactly one reserved signal color (amber) used only for "active / selected / this needs attention" — never decoration. Tabular monospace numerals for every dimension/count field. Condensed uppercase tracked caps for section labels and titles (existing type voice, tightened). Hairline 1px rules as the only dividers; no shadows except the sheet's own drop shadow on the page. Docked sliding panels replace floating popovers for Components/Layouts/Export.

STORY: A DM opens the tool, immediately reads the page grid and current tool state, picks an element type or template, and edits precise numeric properties without hunting through generic form rows; alignment/grouping actions read as a real toolbar with icons and tooltips, not a wall of text buttons.

FIRST VIEWPORT: Top bar holds page name + dimensions (left), live status (center-left), and a compact icon-button cluster for undo/redo/zoom/preview/save/export (right) — all in the neutral chrome with tabular zoom %. Left tool rail is icon buttons in a single row with active-state amber underline, plus two dock-toggle buttons (Components, Layouts) that slide fixed panels in from the left over the workspace edge rather than opening a floating popover. Workspace is the neutral dark ground with the white sheet centered, unchanged. Right inspector is grouped into clearly ruled sections with dense two-column numeric rows (label left, tabular value input right) and an icon toolbar for arrange actions (align/order/group) with tooltips, replacing the current grid of text buttons.

FORM: Machinist/technical-instrument spec-sheet register — dimension-callout precision, title-block-style status bar, monospace tabular numerics — built code-led directly in CSS/TSX, no comp.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
