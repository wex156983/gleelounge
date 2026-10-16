import { test, expect, type Page } from '@playwright/test'
import { guardConsole, createRoom, joinRoom } from './helpers'

// Reads the live Word Sprint criterion off the phone and builds a word that satisfies it.
async function wordFromCriterion(phone: Page): Promise<string> {
  const crit = phone.locator('div.text-xl.font-bold').filter({ hasText: /letters/i }).first()
  await expect(crit).toBeVisible({ timeout: 20_000 })
  const text = (await crit.innerText()).replace(/\s+/g, ' ').trim()
  const m = text.match(/the letter ([A-Z]),\s*(\d+)\+ letters/i)
  const letter = (m?.[1] ?? 'A').toUpperCase()
  const minLen = Number(m?.[2] ?? 4)
  if (/starts/i.test(text)) return (letter.toLowerCase() + 'zzqzz').slice(0, Math.max(minLen, 5))
  if (/ends/i.test(text)) return 'zzqzz' + letter.toLowerCase()
  return 'zz' + letter.toLowerCase() + 'qzz'
}

test.describe('F06 reconnect', () => {
  test('F06-H1 phone drops mid-game and resumes the controller', async ({ browser }) => {
    test.setTimeout(120_000)

    const tv = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    guardConsole(tv)
    const code = await createRoom(tv)

    const phone = await browser.newPage({ viewport: { width: 390, height: 844 } })
    guardConsole(phone)
    await phone.goto(`/join?room=${code}`)
    await phone.getByLabel('Your name').fill('DropMe')
    await phone.getByRole('button', { name: /join the party/i }).click()
    await expect(phone.getByRole('button', { name: /ready/i })).toBeVisible({ timeout: 5000 })

    const phoneB = await browser.newPage({ viewport: { width: 390, height: 844 } })
    guardConsole(phoneB)
    await joinRoom(phoneB, code, 'Sidekick')

    // host starts Word Sprint; phone becomes the controller
    await tv.getByRole('button', { name: /word sprint/i }).first().click()
    await tv.getByRole('dialog').getByRole('button', { name: /^select$/i }).click()
    await tv.getByRole('button', { name: /^start word sprint$/i }).click()
    await expect(phone.getByLabel('Your word')).toBeVisible({ timeout: 20_000 })

    // drop the phone: a full navigation away closes its socket; the server marks it disconnected
    await phone.goto('/')
    await expect(phone.getByLabel('Your word')).toHaveCount(0, { timeout: 10_000 })

    // come back with the same code + stored identity -> resume mid-game
    await phone.goto(`/join?room=${code}`)
    await phone.getByLabel('Your name').fill('DropMe')
    await phone.getByRole('button', { name: /join the party/i }).click()

    // the controller comes back and the game keeps running (no restart)
    const word = await wordFromCriterion(phone)
    const pad = phone.getByLabel('Your word')
    await expect(pad).toBeVisible({ timeout: 20_000 })

    // prove the resumed controller actually works end-to-end
    await pad.fill(word)
    await phone.getByRole('button', { name: /send/i }).click()
    await expect(tv.getByText(word, { exact: false }).first()).toBeVisible({ timeout: 15_000 })

    // the dropped player is reconnected in the lobby list on the big screen
    await expect(tv.getByText('DropMe').first()).toBeVisible()

    await phone.close()
    await phoneB.close()
    await tv.close()
  })
})
