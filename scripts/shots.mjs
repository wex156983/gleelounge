// Capture the clone's key screens into replica/clone-screens/ for the parity record.
// Run with the dev servers up (Vite :5173).
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const OUT = new URL('../replica/clone-screens/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:5173'

const TV = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }

const browser = await chromium.launch()
try {
  // S01 landing (TV)
  {
    const page = await browser.newPage({ viewport: TV })
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.screenshot({ path: OUT + 'S01-landing.png', fullPage: true })
    await page.close()
  }
  // S03 join form (phone)
  {
    const page = await browser.newPage({ viewport: PHONE })
    await page.goto(BASE + '/join', { waitUntil: 'networkidle' })
    await page.screenshot({ path: OUT + 'S03-join.png', fullPage: true })
    await page.close()
  }
  // S02 console lobby + S05 library grid (TV)
  {
    const page = await browser.newPage({ viewport: TV })
    await page.goto(BASE + '/console', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /create a room/i }).click()
    await page.locator('header .font-mono').waitFor({ state: 'visible', timeout: 8000 })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: OUT + 'S02-lobby.png', fullPage: true })
    await page.close()
  }
  console.log('screenshots written to', OUT)
} finally {
  await browser.close()
}
