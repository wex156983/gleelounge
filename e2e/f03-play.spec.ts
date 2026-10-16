import { test, expect, type Page } from '@playwright/test'
import { guardConsole, createRoom, joinRoom } from './helpers'

test.describe('F03 host picks a game and everyone plays', () => {
  test.beforeEach(async ({ page }) => guardConsole(page))

  test('F03-H1 play Reaction Duel to results, then back to lobby', async ({ browser }) => {
    test.setTimeout(120_000)

    const tv = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    guardConsole(tv)
    const code = await createRoom(tv)

    const phoneA = await browser.newPage({ viewport: { width: 390, height: 844 } })
    const phoneB = await browser.newPage({ viewport: { width: 390, height: 844 } })
    guardConsole(phoneA)
    guardConsole(phoneB)
    await joinRoom(phoneA, code, 'TapHero')
    await joinRoom(phoneB, code, 'FastFinger')
    const phones = [phoneA, phoneB]

    // host opens the detail dialog, selects, then starts
    await tv.getByRole('button', { name: /reaction duel/i }).first().click()
    await tv.getByRole('dialog').getByRole('button', { name: /^select$/i }).click()
    await tv.getByRole('button', { name: /^start reaction duel$/i }).click()

    await expect(tv.getByText(/round 1/i)).toBeVisible({ timeout: 10_000 })
    await expect(phoneA.getByRole('button', { name: /tap now|wait for green/i })).toBeVisible({
      timeout: 10_000,
    })

    // play 5 rounds: each phone taps as soon as its button is armed
    for (let round = 0; round < 5; round++) {
      await Promise.all(
        phones.map(async (p) => {
          const tapBtn = p.getByRole('button', { name: /^tap now!$/i })
          await tapBtn.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {})
          await tapBtn.click({ timeout: 3000 }).catch(() => {})
        }),
      )
      await tv.waitForTimeout(2200)
    }

    // results screen: podium + rematch
    await expect(tv.getByRole('button', { name: /rematch/i })).toBeVisible({ timeout: 30_000 })
    await expect(tv.getByRole('button', { name: /back to lobby/i })).toBeVisible()

    // back to lobby
    await tv.getByRole('button', { name: /back to lobby/i }).click()
    await expect(tv.getByRole('heading', { name: /players/i })).toBeVisible({ timeout: 5000 })

    for (const p of phones) await p.close()
    await tv.close()
  })

  test('F03-H2 quick Quiz Party flow (multiple choice)', async ({ browser }) => {
    test.setTimeout(120_000)

    const tv = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    guardConsole(tv)
    const code = await createRoom(tv)

    const phoneA = await browser.newPage({ viewport: { width: 390, height: 844 } })
    const phoneB = await browser.newPage({ viewport: { width: 390, height: 844 } })
    guardConsole(phoneA)
    guardConsole(phoneB)
    await joinRoom(phoneA, code, 'QuizWhiz')
    await joinRoom(phoneB, code, 'BrainBox')
    const phones: Page[] = [phoneA, phoneB]

    await tv.getByRole('button', { name: /quiz party/i }).first().click()
    await tv.getByRole('dialog').getByRole('button', { name: /^select$/i }).click()
    await tv.getByRole('button', { name: /^start quiz party$/i }).click()

    await expect(phoneA.getByRole('group', { name: /answers/i })).toBeVisible({ timeout: 15_000 })

    // answer all 5 questions on both phones (round ends early once everyone answers)
    for (let q = 0; q < 5; q++) {
      await Promise.all(
        phones.map(async (p) => {
          const first = p.getByRole('group', { name: /answers/i }).getByRole('button').first()
          await first.click({ timeout: 20_000 }).catch(() => {})
        }),
      )
      await tv.waitForTimeout(1000)
    }

    await expect(tv.getByRole('button', { name: /back to lobby/i })).toBeVisible({
      timeout: 30_000,
    })

    for (const p of phones) await p.close()
    await tv.close()
  })
})
