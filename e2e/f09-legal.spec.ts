import { test, expect } from '@playwright/test'
import { guardConsole } from './helpers'

test.describe('legal pages', () => {
  test.beforeEach(async ({ page }) => guardConsole(page))

  test('privacy page renders with heading', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible()
    await expect(page.getByText(/no accounts/i).first()).toBeVisible()
  })

  test('terms page renders with heading', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.getByRole('heading', { name: /terms of service/i })).toBeVisible()
    await expect(page.getByText(/acceptable use/i)).toBeVisible()
  })

  test('landing footer links to legal pages', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /terms/i })).toBeVisible()
  })
})
