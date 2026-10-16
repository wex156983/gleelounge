import { test, expect } from '@playwright/test'
import { guardConsole, createRoom, joinRoom } from './helpers'

test.describe('F02 friend joins from phone', () => {
  test.beforeEach(async ({ page }) => guardConsole(page))

  test('F02-H1 join by code lands in lobby with ready button', async ({ page, browser }) => {
    // TV context creates the room
    const tv = await browser.newPage()
    guardConsole(tv)
    const code = await createRoom(tv)

    // phone joins
    await joinRoom(page, code, 'Tester')
    await expect(page.getByRole('button', { name: /ready/i })).toBeVisible()
    await expect(page.getByText(new RegExp(code)).first()).toBeVisible()

    // host sees the player appear
    await expect(tv.getByText('Tester')).toBeVisible({ timeout: 5000 })

    await tv.close()
  })

  test('F02-E1 wrong code shows room-not-found error', async ({ page }) => {
    await page.goto('/join')
    const cells = page.getByRole('group', { name: /room code/i }).getByRole('textbox')
    for (let i = 0; i < 4; i++) await cells.nth(i).fill('Z')
    await page.getByLabel('Your name').fill('Lost')
    await page.getByRole('button', { name: /join the party/i }).click()
    await expect(page.getByText(/room not found/i)).toBeVisible({ timeout: 5000 })
  })
})
