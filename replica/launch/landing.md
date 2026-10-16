# Landing page — GleeLounge

Voice: playful, warm, direct (see `replica/brand.md`). Accent `#f72585`, on-accent
`#1a0508`. Angle A from `replica/fixes.md`: for party hosts sick of ads, paywalls
and 2-player caps, every game goes to every player, free, no account, no install.

Built in `src/screens/Landing.tsx`. Sections below in order.

## 1. Hero

- **Headline:** Every game. Every player. Free.
- **Sub-line:** Your TV is the screen, your phones are the controllers. No ads,
  no paywall, no account — a 4-letter code and everyone's playing.
- **Primary button:** Start a game right here → `/console`
- **Secondary button:** Join from your phone → `/join`
- **Visual:** screenshot of the real console lobby (room code + QR + player row)
  on a laptop, with two phones flanking it. Use the product, not stock art.

## 2. The problem

Two top "hate" themes from the research (`replica/feedback.md`), paraphrased —
never quote reviewers on the page.

- Party-game apps gate the good stuff behind a subscription: two players free,
  the rest locked, an ad break every round.
- Cancelling is a maze, and people still get charged after they cancel.

Close with one line: **GleeLounge is the opposite. Everything free, for everyone,
no strings.**

## 3. How it works

Three steps (already in the product copy):

1. **Open on the big screen.** Your TV, laptop or tablet in the browser — this
   is the console.
2. **Join from your phone.** Type the 4-letter code — your phone becomes the
   controller.
3. **Pick a game and go.** Every game unlocked, no ads, no sign-up. Switch anytime.

## 4. Features

Lead with the fixes (from `replica/fixes.md` §4), not the parity basics. Parity
(room codes, game library, scoreboard) is the price of entry and gets one line
under the heading.

| Feature | Fix it answers | Copy |
|---|---|---|
| Every game free, every player | #1 — paywall (51 reviews) | "All 7 games, up to 8 players, zero ads. No 'unlock the rest' screen, ever." |
| Your phone can lock and you stay in | #2 — disconnects (33 reviews) | "Screen locks, call comes in, you wander off — come back and you're still in the round. The party never gets kicked." |
| Any screen is the console | #7 — iPad/tablet (12 reviews) | "A TV browser, a laptop on the coffee table, an iPad — anything that opens a website is the big screen." |
| No account, no install, no app store | angle | "Open a link and play. We never ask for an email, a card or a download." |
| Play solo, or grab a keyboard | #3 | "Some games play solo, and the big screen takes a keyboard when a phone isn't handy." |
| Scan or type — your call | #5 | "A QR code up top and a big 4-letter code below it. Join the way you prefer." |

## 5. Pricing

Three cards from `replica/launch/pricing.md`. Free is the product; the paid tiers
change nothing about game access.

## 6. FAQ

Real objections, in the brand voice:

- **Is it really free?** Yes. Every game, every player, no ads. No card, no
  account, no catch.
- **What do I need?** Anything with a browser — a TV, a laptop or an iPad for the
  big screen, and a phone for each player.
- **How many people can play?** Up to 8, depending on the game. The lobby shows
  "players (n/8)" live.
- **Do I have to install anything?** No. The screen opens a website; phones scan
  a QR code. That's the whole setup.
- **Can I play alone?** Some games yes — Word Sprint, Quiz Party and Karts play
  solo.
- **What if someone's phone dies mid-game?** Reopen the link, type your name,
  you're back in the same round with your score intact.
- **Does it work over a video call?** Yes — share the screen and everyone joins
  from their own phone, anywhere.

## 7. Final call to action

- **Headline:** Your friends are already holding the controllers.
- **Button:** Start a room → `/console`

## Footer

GleeLounge — a party gaming platform. Not affiliated with any other console.
Built for friends in the same room. Links: Terms, Privacy, Support.

## Build notes

- All copy original, in brand voice. No competitor names anywhere on the page.
- Reuse existing components: `Button`, `GameCard`, tokens in `tailwind.config.ts`.
- Run `replica-design/contrast.py` against `replica/design/tokens.json` after any
  colour change; the page uses only tokens, so it stays AA.
