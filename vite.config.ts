import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE=1 → one self-contained HTML file (used for quick previews). Normal build is Vercel-ready.
export default defineConfig({
  plugins: [react(), tailwind(), ...(process.env.SINGLE ? [viteSingleFile()] : [])],
  build: { chunkSizeWarningLimit: 900 },
})
