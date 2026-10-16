# fixes.md — what AirConsole users hate, miss, and what GleeLounge does about it

Sample: **310 reviews from 3 sources** (App Store official RSS 253, Hacker News
Algolia 37, Google Play listing 20), 273 with star ratings, spanning 2015–2026.
Generated from `replica/feedback.md` (theme ranking) + hand reading of the
unthemed negatives and HN threads. Every quote is verbatim with its source link.
Reddit was unreachable (official API 403, old.reddit JS-gated) — noted, not
faked. No App Store reviews were available per-review permalinks, so all
App Store quotes link the app page
(https://apps.apple.com/us/app/id1017688554).

## 1. What they hate

| # | Problem | Reviews | Sources | Evidence |
|---|---------|---------|---------|----------|
| 1 | Hero paywall: most games and >2 players require a subscription | 51 | 3 | "The free games are fun, but 90% of them cost money to play, and you need to spend money to play with more than 3 players!" (App Store 1★, https://apps.apple.com/us/app/id1017688554); "you have to pay if you want to play with more then 2 people. To me, this isnt a great decision on their part because I think their largest audience would be party games" (Google Play 2★, https://play.google.com/store/apps/details?id=com.airconsole.controller&hl=en&gl=US) |
| 2 | Crashes, freezes, games that never load | 33 | 3 | "Every time I get the app to connect and open a game it crashes and returns me to the main screen. Uninstalled and deleted subscription." (App Store 1★); "The games are varied and entertaining, but it crashes too often." (App Store 3★); "Nothing worked. we tried a couple games but the first kept crashing and the app couldn't recover." (Google Play 1★) |
| 3 | Billing traps: charged after cancel, no refunds | 18 | 2 | "I cancelled the subscription at least 5 different times and I'm still getting charged!!!" (App Store 1★); "when I requested a refund due to the glitches they conveniently said it went against their refund policy" (Google Play 1★) |
| 4 | Lag and slow loading, even on good internet | 20 | 3 | "Most of the games are blocked by a paywall and it is really laggy even on internet that's pretty good. (30mbps)" (App Store 1★); "it's SUPER laggy, the only time that it isn't laggy is when only one phone is connected" (Google Play 3★) |
| 5 | Ads and forced ad breaks mid-game | 15 | 2 | "ads on the phone are stuck… it's now a game where people pay to win the game, ruining the experience for everyone" (HN, https://news.ycombinator.com/item?id=17985164); "the whole 5 min and 30 sec brake every 30 mins that's just doing too much" (App Store 2★); "after every game it slaps you with a 1 minute long add" (App Store 1★) |
| 6 | One phone locking or backgrounding kicks the whole party | 2+ | 1 | "When my screen locks or a notification appears, the app disconnects therefore kicking everyone from the game" (App Store 1★, https://apps.apple.com/us/app/id1017688554); "the app kept freezing up and we would have to reenter the game during play. When that happened out points went back to 0." (App Store 4★) |
| 7 | "Used to be free, got greedy" — the 2017 paywall switch still burns | 7 | 2 | "It used to be so fun, but now they've become over come with greed." (App Store 1★); "No more getting high with airconsole parties" (HN, https://news.ycombinator.com/item?id=17985817) |

Thin (listed, not trends): review-prompt spam (2, 1 source), profile sync
glitches (2, 2 sources).

## 2. What is missing (asked for by name)

| # | Request | Reviews | Sources | Evidence |
|---|---------|---------|---------|----------|
| 1 | iPad / tablet works as the big screen | 12 | 3 | "Why isn't iPad screen an option? iPads support up to 4 controls connecting at once for couch co-op games, so why not support 4 phones connecting to an iPad?" (App Store 1★); "It won't work on my iPad.end." (App Store 1★) |
| 2 | More free games, more genres (sports, combat, co-op) | ~10 | 3 | "Where's American Football? Boxing? Tennis? Baseball?" (App Store 2★); "if you could make maybe some combat games free and some cooperation games free that would be really nice" (App Store 4★) |
| 3 | A one-time purchase instead of a subscription | 4 | 2 | "there should be an option of a one time fee instead of only a subscription" (Google Play 2★); "Make the hero exclusive a one time payment for the love of god. NOBODY LIKES SUBSCRIPTIONS" (App Store 1★); "Sell game packs with like 10 games instead" (App Store 2★) |
| 4 | Roku / more TVs as the screen | 5 | 1 | "Can't play on Roku tv" (App Store 3★); "Put ROKU YV also PLs" (App Store 2★) |
| 5 | Bluetooth controllers as input | 2 | 2 | "It would be really nice if you could connect s bluetooth controller to your mobile device and use that" (App Store 5★); "have fun watching ads on your phone… They really need some form of Bluetooth alternative" (HN, https://news.ycombinator.com/item?id=17987577) |
| 6 | Latency indicator on the controller | 1 | 1 | "Can you possibly put an indicator of how slow the response will be? (Kind of like a signal strength meter…)" (App Store 4★) — thin, but cheap |

## 3. What is unsolved (whole jobs the original ignores)

1. **The occasional party host.** People who play a few times a month are the
   best customers and the worst fit for a subscription. "Airconsole isn't a
   daily thing for most people (or weekly), a subscription doesn't make sense
   for most people in this format." (App Store 3★,
   https://apps.apple.com/us/app/id1017688554). Nobody serves them: Jackbox
   charges per pack, AirConsole charges monthly forever.
2. **Households without a payment method.** Kids and teens whose parents won't
   add a card: "my parents love saving money… if you could make a lot of the
   games free that would be awesome" (App Store 4★); "my mom won't buy me"
   (App Store 3★). The original locks them out at 2 players.
3. **Friends on a video call.** COVID made this the killer use case — "We set
   up a group chat and screen share so we can all play together despite being
   locked down in different states/ homes" (App Store 5★) — but the original's
   disconnect-on-lock behavior actively breaks it, because on a call everyone's
   phone is doing other things.
4. **Anyone who paid and still couldn't play.** The Hero entitlement not
   showing up, games "unavailable" behind the paywall, crashes after purchase —
   a trust hole the brand leans on but never fills.

## 4. Fix plan (evidence × cost)

| # | Fix | Size | Skill / where | Evidence it matters | Status in GleeLounge |
|---|-----|------|---------------|---------------------|----------------------|
| 1 | Zero ads, zero paywall, every game free to every player | S (decision) | already shipped | hate #1 (51), #5 (15), #7 (7) = 73 of 310 reviews | **Done by design** — no billing code exists; keep it that way at launch |
| 2 | A phone that locks, backgrounds or drops must never kick the party; rejoin mid-game with state intact | S | server + phone (`server/rooms.ts`, reconnect) | hate #2 (33), #6 (2+), several 1★ "crashed and everyone left" | **Done and e2e-verified** (f08-reconnect, BUG-009/010 era); phone auto-rejoin still uses stored playerId — good |
| 3 | Solo play + keyboard fallback on the big screen | M | `src/games/*`, Console | missing #2 partially ("I played by myself few games"), parity top-1 | **Build next** — features.csv rows 16/21 flip to planned |
| 4 | Pause menu on the big screen | S | screen UI | hate #5 shows hosts need breaks without killing the round | **Build next** — row 18 |
| 5 | Real scannable QR + explicit Copy link button | S | Landing/Console | join friction; praise for auto-code shows people hate typing ("gives you the code automatically… so i dont have to type it", App Store 5★) | **Build next** — rows 3/27 |
| 6 | Grow the free catalog, sports/party genres first | L | `src/games/*` | missing #2 (~10 reviews, 3 sources) | Roadmap after launch; each new game is original IP |
| 7 | Document + verify iPad/tablet as the big screen (any browser) | S | QA + landing copy | missing #1 (12 reviews, 3 sources) | **Free win**: clone is a web app; add f-e2e on iPad viewport and say so on the landing page |
| 8 | One-time / no-subscription pricing story | — | /replica-launch | missing #3 (4), billing #3 (18) | Pricing decision belongs to launch skill; input: no subscription, ever, is the loudest unmet ask |

Skipped on purpose: Roku/TV native apps (parity `skip`, web-only), Bluetooth
controller input (thin, 2 reviews), latency meter (thin, 1 review).

## 5. The angle

Three options, each grounded in a top theme:

**A (recommended).** For party hosts who are sick of ads, paywalls and 2-player
caps killing the night, GleeLounge gives every game to every player, free, with
no account and no app to install — a 4-letter code and you're playing.
Evidence: price/paywall (51 reviews) + ads (15) + "got greedy" (7) across all
3 sources; 73 of 310 reviews touch this cluster.

**B.** For families and friend groups who play a few times a month, GleeLounge
is a one-link party night instead of a subscription you forget to cancel.
Evidence: billing traps (18 reviews, avg 1.4★) + "a subscription doesn't make
sense for most people in this format."

**C.** For friend groups on a video call, GleeLounge is the party console that
survives a locked phone screen — nobody gets kicked, nobody loses the round.
Evidence: crashes/disconnects (33 reviews) + the phone-lock kick (App Store 1★).

**Recommendation: A.** It has the widest evidence, it is the cheapest to keep
true (we already built it that way), and it feeds replica-brand's voice
(no-guilt, no-paywall, play-now) and replica-launch's hero section. B is a
strong sub-headline for the family audience; C is a great feature callout for
the remote-play crowd. Do not put AirConsole's name in our name, ads or store
listing; any factual comparison page is a legal question for a lawyer.
