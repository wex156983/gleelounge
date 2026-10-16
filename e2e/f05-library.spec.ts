import { test, expect } from '@playwright/test'
import { guardConsole, createRoom } from './helpers'

test.describe('S05 library filters', () => {
  test.beforeEach(async ({ page }) => guardConsole(page))

  test('genre and player-count filters narrow the grid', async ({ page }) => {
    await createRoom(page)

    // filter to racing
    await page.getByRole('button', { name: 'racing', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Karts' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Quiz Party' })).toHaveCount(0)

    // switch to word
    await page.getByRole('button', { name: 'word', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Word Sprint' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Karts' })).toHaveCount(0)

    // bucket 2–4: games playable with 2–4 people (playersMin <= 4)
    await page.getByRole('button', { name: 'All', exact: true }).click()
    await page.getByRole('button', { name: '2–4', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Karts' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Bomber Arena' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Draw & Guess' })).toBeVisible()
  })

  test('game detail modal opens and can select game', async ({ page }) => {
    await createRoom(page)
    await page.getByRole('button', { name: /word sprint/i }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Word Sprint' })).toBeVisible()
    await dialog.getByRole('button', { name: /^select$/i }).click()
    await expect(page.getByRole('button', { name: /start word sprint/i })).toBeVisible()
  })
})
