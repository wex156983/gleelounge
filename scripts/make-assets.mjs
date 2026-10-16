// Renders the OG image and touch icons from HTML using the installed Playwright
// Chromium. Run: node scripts/make-assets.mjs
import { chromium } from '@playwright/test'

const FONT_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap" rel="stylesheet">'

const base = `
  * { box-sizing: border-box; margin: 0; }
  body { font-family: 'Fredoka', system-ui, sans-serif; background: #0b0e14; color: #f2f5fa; }
`

const ogHtml = `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}<style>
  ${base}
  .card { width: 1200px; height: 630px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 28px;
          background: radial-gradient(120% 120% at 50% -10%, #1f2739 0%, #0b0e14 60%); }
  .logo { display: flex; align-items: center; gap: 22px; font-size: 84px; font-weight: 700; }
  .logo b { color: #f72585; }
  h1 { font-size: 68px; font-weight: 700; text-align: center; letter-spacing: -1px; }
  h1 i { color: #f72585; font-style: normal; }
  p { font-size: 32px; color: #9aa5bb; font-weight: 400; }
  .pills { display: flex; gap: 16px; margin-top: 6px; }
  .pill { background: #171d2b; border: 1px solid #2a3347; color: #f2f5fa;
          padding: 12px 24px; border-radius: 999px; font-size: 26px; }
</style></head><body>
  <div class="card">
    <div class="logo">
      <svg width="86" height="86" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b0e14"/>
        <path d="M18 40a14 14 0 0 1 28 0" fill="none" stroke="#f72585" stroke-width="7" stroke-linecap="round"/>
        <circle cx="32" cy="44" r="4.5" fill="#f72585"/></svg>
      <span><b>Glee</b>Lounge</span>
    </div>
    <h1>Every game. Every player. <i>Free</i>.</h1>
    <p>Your TV is the screen. Your phones are the controllers.</p>
    <div class="pills"><span class="pill">No ads</span><span class="pill">No paywall</span><span class="pill">No account</span></div>
  </div>
</body></html>`

const iconHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
  ${base}
  body { width: 180px; height: 180px; display: flex; align-items: center;
         justify-content: center; background: #0b0e14; border-radius: 40px; }
</style></head><body>
  <svg width="180" height="180" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b0e14"/>
    <path d="M18 40a14 14 0 0 1 28 0" fill="none" stroke="#f72585" stroke-width="7" stroke-linecap="round"/>
    <circle cx="32" cy="44" r="4.5" fill="#f72585"/></svg>
</body></html>`

const browser = await chromium.launch()
async function shot(html, w, h, out) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: out })
  await page.close()
  console.log('wrote', out)
}
await shot(ogHtml, 1200, 630, 'public/og.png')
await shot(iconHtml, 180, 180, 'public/apple-touch-icon.png')
await browser.close()
