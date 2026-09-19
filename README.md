# dungeon-sheets

A local-first character sheet app scaffolded with React and TanStack Start.

The project includes:

- TanStack Router and Start for file-based routing and SSR
- TanStack Query for asynchronous data
- TanStack DB with a localStorage-backed collection for persistent client data
- TanStack Store for transient client UI state
- TanStack Devtools for Router and Query inspection

Install dependencies and start the development server:

```bash
bun install
bun run dev
```

The app is available at `http://localhost:3000`. Route files live in
`src/routes`, persistent collections in `src/data`, and transient UI stores in
`src/stores`.

Build and validate the production app with:

```bash
bun run build
```

## GitHub Pages

Pushing to `main` builds a static, client-only export (TanStack Start's SPA
prerender mode) and deploys it to GitHub Pages via
`.github/workflows/deploy.yml`. The build sets `GITHUB_PAGES=1`, which points
`vite.config.ts` at the `/dungeon-sheets/` base path the project page is
served from; run `GITHUB_PAGES=1 bun run build` locally to reproduce that
build exactly.
