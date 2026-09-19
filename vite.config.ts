import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const base = process.env.GITHUB_PAGES ? '/dungeon-sheets/' : '/'

export default defineConfig({
  base,
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tanstackStart({ spa: { enabled: true, prerender: { outputPath: '/index' } } }), viteReact()],
})
