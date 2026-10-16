# Launch plan — GleeLounge

Goal: first 100 real players, mostly in the same room, from the segment the
original's reviews describe. No paid ads at launch. Every claim backed by the
product or by the research in `replica/`.

## 0. The competitive reality (read this first)

The research found that "free, no subscription, no app" is **not** an empty
position — it is crowded. Direct competitors already claiming it, found
2026-10-16:

| Competitor | Claim | Games | Source |
|---|---|---|---|
| poyo.tv | "100% free — no subscription, no app, no sign-ups"; FAQ names Jackbox and AirConsole by name | 17 | https://poyo.tv/party-games |
| phonesout.games | "No apps · No accounts · Just play" | 106 | https://www.phonesout.games/ |
| party.games | "Absolutely free!" | handful | https://party.games/ |
| gamingcouch.com | "Free AirConsole alternative: no app, no subscription" | 15+ | https://gamingcouch.com/airconsole-alternative |
| huddlenight.com | "Free phone-controller party games", no shared screen | 7 | https://www.huddlenight.com/games |
| padlessbox.com | free browser party games guide | — | https://padlessbox.com/blog |

So "we're free" alone will not win. GleeLounge's wedge is **depth of the games
and reliability**, not the price:

1. **Real games, not just word/trivia lists.** Karts (top-down racing) and Bomber
   Arena (maze action) are original arcade games, not a prompt-and-vote loop.
   Most free competitors are words, trivia and bluffing.
2. **Reconnect that actually survives a locked phone** (fix #2, 33 reviews in the
   research). poyo mentions remembering players; most others do not.
3. **The full 8-player lobby with live count** and a smooth game-switch, matching
   the original's core loop rather than one game per page.

Lead with the games on the landing page's feature block, and let "free" be the
remover of the main objection, not the headline promise.

## 1. Beta list before launch

- A single-page waitlist at the domain root that captures an email and one field:
  "how do you usually play with friends?" Keep it one field.
- Seed it from the exact people the research describes: game-night hosts, remote
  teams, families. Where they already talk (below), link the waitlist, never spam.
- Bar to launch: 50 emails on the list. Ship to the list first, watch the logs
  for one week, fix what breaks, then open it publicly.

## 2. Analytics and error tracking (before any invite goes out)

- Privacy-respecting product analytics (e.g. Plausible/Umami, self-hosted) — page
  views and events only, no personal data. Rooms are ephemeral; do not log names.
- Events to track: room created, phone joined, game started, game finished,
  reconnect, room closed. These map 1:1 to the core loop.
- Error tracking (Sentry or similar) on both the big-screen and phone clients.
  The original's #2 complaint is crashes; we get to prove we don't have them.
- A simple dashboard: rooms/day, median players/room, game completion rate,
  reconnect success rate.

## 3. Where the original's unhappy users talk

From the research (`replica/reviews.csv`, `replica/feedback.md`) — these are
research sources; do not quote them as testimonials.

- **App Store review section** of the original (id1017688554) and the Google Play
  listing (`com.airconsole.controller`): the recurring themes are paywall, ads and
  phone-lock disconnects. Read, do not astroturf.
- **Hacker News** threads where the original was discussed (e.g.
  news.ycombinator.com/item?id=17985164, item?id=17985817). The crowd there cares
  about the tech and about "used to be free, got greedy". A Show HN is a fit.
- **Reddit** r/party_games, r/couchgaming, r/AndroidGaming, r/gamedev. The official
  Reddit API returned 403 during research, so this was not machine-read — visit by
  hand, follow each sub's self-promo rules, post only where it genuinely helps.

## 4. Launch posts

**Show HN** (Hacker News) — lead with the fix, not the category:

> Show HN: GleeLounge – party games where a locked phone no longer ends the round
>
> One screen, phones as controllers, every game free. The thing I cared about:
> phones lock and drop all the time, so the session remembers you and you rejoin
> the same round with your score. 7 original games, no ads, no account. Built on
> Vite/React/Socket.io. Happy to answer anything about the realtime reconnect.

Rules: post the working link, no marketing tone, answer every comment. Best window
is a weekday morning US Eastern.

**Product Hunt** — same fix as the headline, gallery = real screenshots (lobby,
in-game on Karts, the reconnect banner). Tagline under 60 chars:
"Party games on your TV. Your phone is the controller."

**Short demo video** (60–90s, vertical + horizontal): create room → two phones
join → play Reaction Duel → one phone locks → it rejoins mid-round. That last
beat is the whole pitch.

## 5. The first 10 users to talk to by hand

Find them, onboard them, watch them. In order:

1. Three game-night hosts from the waitlist (people who host monthly).
2. Two remote-team organisers (the video-call use case the research flagged).
3. Two teachers or youth-group leaders (large rooms, mixed ages).
4. Two families with kids (the "parents won't add a card" segment).
5. One person who left the original a 1★ review *about the paywall* — reachable,
   not anonymous.

For each: watch a session, note the first moment they hesitate, fix that first.

## 6. Launch checklist

- [ ] `listing.py` passes (0 errors) — done 2026-10-16.
- [ ] Screenshots at current App Store Connect / Play Console sizes (re-check both
      consoles at upload; they change). Show the games and the reconnect, per
      guideline 4.1 (Copycats) — original UI and original games, not a clone skin.
- [ ] Privacy policy URL, support URL, Terms live on the domain.
- [ ] Data safety form (Play) and privacy labels (App Store) filled to match what
      the product actually collects (nothing linked to identity at launch).
- [ ] Age rating: 13+ (matches the original's rating; games have mild cartoon
      violence in Karts/Bomber Arena).
- [ ] Review notes + a demo room the reviewer can open, with two "players" they can
      drive from a browser tab if they have no second phone.
- [ ] Reconnect tested on a real iOS + Android phone, screen locked, mid-round.
- [ ] Analytics + error tracking live for one week before opening to the public.

## 7. What success looks like (first 30 days)

- 100 rooms created, average 3+ players per room.
- Reconnect success rate above 95% (the differentiator; prove it).
- At least 3 unsolicited "this is what AirConsole should have been" style posts,
  unprompted, from real users.
- No S1/S2 bugs open (see `replica/bugs.md`).

Next: `/replica-deploy`.
