// Exports consistent PNG renders of each finish: public/renders/aura-one-<finish>.png
// Usage: npm run build && npm run render   (first time: npx playwright install chromium)
import { chromium } from 'playwright'
import { preview } from 'vite'
import { mkdirSync } from 'node:fs'

const server = await preview({ preview: { port: 4173 } })
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })
mkdirSync('public/renders', { recursive: true })
for (const id of ['midnight', 'titanium', 'arctic']) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1400 }, deviceScaleFactor: 1.5 })
  await page.goto(`http://localhost:4173/?render=${id}`)
  await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 })
  await page.screenshot({ path: `public/renders/aura-one-${id}.png` })
  console.log('rendered', id)
  await page.close()
}
await browser.close()
await server.close()
