import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { guardConsole, createRoom } from './helpers'

test.describe('F01 host starts a session', () => {
  test.beforeEach(async ({ page }) => guardConsole(page))

  test('F01-H1 create room shows code, QR, empty player list', async ({ page }) => {
    await page.goto('/console')
    await expect(
      page.getByRole('heading', { name: /gleelounge/i }).first(),
    ).toBeVisible()

    const code = await createRoom(page)
    expect(code).toMatch(/^[A-Z]{4}$/)

    await expect(page.getByRole('heading', { name: /players/i })).toBeVisible()
    await expect(page.getByText(/players \(0\/16\)/i)).toBeVisible()
    await expect(page.getByText(/waiting for friends/i)).toBeVisible()
    await expect(page.getByRole('img', { name: /qr code/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /selected/i })).toHaveCount(0)

    const a11y = await new AxeBuilder({ page }).analyze()
    expect(a11y.violations).toEqual([])
  })

  test('F01-H1b landing page renders and links to console/join', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /start playing/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /join from your phone/i })).toBeVisible()

    const a11y = await new AxeBuilder({ page }).analyze()
    expect(a11y.violations).toEqual([])
  })
})
