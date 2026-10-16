import { test, expect, type Page } from '@playwright/test'
import { guardConsole, createRoom, joinRoom } from './helpers'

// Reads the live Word Sprint criterion ("starts with the letter A, 4+ letters")
// off the phone and builds a word that satisfies it.
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

test.describe('phone is the controller (code + name entry)', () => {
  test('QR link prefills the code, phone types name, then drives the game', async ({ browser }) => {
    test.setTimeout(120_000)

    const tv = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    guardConsole(tv)
    const code = await createRoom(tv)

    // the join link the QR points at encodes the room
    const phone = await browser.newPage({ viewport: { width: 390, height: 844 } })
    guardConsole(phone)
    await phone.goto(`/join?room=${code}`)

    // BUG-001 regression guard: the code cells are prefilled from the link,
    // so the person only has to type their name.
    const cells = phone.getByRole('group', { name: /room code/i }).getByRole('textbox')
    await expect(cells.nth(0)).toHaveValue(code[0])
    await expect(cells.nth(3)).toHaveValue(code[3])

    // enter a name and connect
    await phone.getByLabel('Your name').fill('TextHero')
    await phone.getByRole('button', { name: /join the party/i }).click()
    await expect(phone.getByRole('button', { name: /ready/i })).toBeVisible({ timeout: 5000 })
    await expect(phone.getByText('TextHero').first()).toBeVisible()

    // second phone so the game's min-player gate is satisfied
    const phoneB = await browser.newPage({ viewport: { width: 390, height: 844 } })
    guardConsole(phoneB)
    await joinRoom(phoneB, code, 'Sidekick')

    // host picks Word Sprint and starts it
    await tv.getByRole('button', { name: /word sprint/i }).first().click()
    await tv.getByRole('dialog').getByRole('button', { name: /^select$/i }).click()
    await tv.getByRole('button', { name: /^start word sprint$/i }).click()

    // the phone is now the gamepad: it shows the criterion and a text pad
    const word = await wordFromCriterion(phone)
    const pad = phone.getByLabel('Your word')
    await expect(pad).toBeVisible({ timeout: 20_000 })

    // the phone drives the game: type a word and send it
    await pad.fill(word)
    await phone.getByRole('button', { name: /send/i }).click()

    // the big screen reflects the phone's input (scored or rejected, it appears)
    await expect(tv.getByText(word, { exact: false }).first()).toBeVisible({ timeout: 15_000 })

    await phone.close()
    await phoneB.close()
    await tv.close()
  })
})
