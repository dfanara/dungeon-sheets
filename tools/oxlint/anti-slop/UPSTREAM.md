# Upstream provenance

- Source repository: https://github.com/dmmulroy/anti-slop
- Upstream commit: unknown; the installed skill metadata does not record a commit.
- Recoverable pristine snapshot: `install-anti-slop` skill hash `4031728fbe75bdcad6ee3208fd52b5d66e167b056fefee1fa9758e9a6cb9c0c8` from `skills-lock.json`.
- Snapshot source: `.agents/skills/install-anti-slop/assets/anti-slop/`
- Installed generic plugin: `tools/oxlint/anti-slop/index.ts`
- Installed optional Effect plugin: `tools/oxlint/anti-slop/effect/index.ts` (not registered because this project does not directly depend on `effect`).
- Intentional deviations: none. The bundled generic plugin is installed unchanged.
- Dependency pairing: `@oxlint/plugins@1.83.0` with installed `oxlint@1.83.0`.
- Verification: `bunx oxlint` passed, and a focused fixture confirmed `anti-slop/no-array-filter-map` rejects the targeted chain while accepting a single-pass alternative.
- Typecheck gap: `bunx tsc --noEmit` reports TS2322 in `shared/dictionary-types.ts:201` under this project's TypeScript 7 configuration.
