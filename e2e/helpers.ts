// Shared helpers for GleeLounge e2e specs.
import { expect, type Page } from '@playwright/test'

export function guardConsole(page: Page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') throw new Error(`console error: ${msg.text()}`)
  })
  page.on('response', (res) => {
    if (res.status() >= 500) throw new Error(`${res.status()} on ${res.url()}`)
  })
}

export async function createRoom(page: Page): Promise<string> {
  await page.goto('/console')
  await page.getByRole('button', { name: /start a room/i }).click()
  const codeEl = page.locator('header .font-mono')
  await expect(codeEl).toBeVisible({ timeout: 5000 })
  const code = (await codeEl.textContent())?.trim() ?? ''
  expect(code).toMatch(/^[A-Z]{4}$/)
  return code
}

export async function joinRoom(page: Page, code: string, name: string) {
  await page.goto(`/join?room=${code}`)
  // code is pre-filled via query param into CodeInput? No — we type it.
  const cells = page.getByRole('group', { name: /room code/i }).getByRole('textbox')
  const count = await cells.count()
  for (let i = 0; i < count && i < code.length; i++) {
    await cells.nth(i).fill(code[i])
  }
  await page.getByLabel('Your name').fill(name)
  await page.getByRole('button', { name: /join the party/i }).click()
  await expect(page.getByRole('button', { name: /ready/i })).toBeVisible({ timeout: 5000 })
}
