# Parity report — GleeLounge (clone) vs AirConsole (original)

Date: 2026-10-16  Build: local-dev  Tools: `parity.py`, e2e suite (Playwright, 10 specs)

## Scores

| metric | value |
| --- | --- |
| **Overall** | **79.8 / 100** |
| Feature score | 79.8 (27 features counted) |
| Must-haves | **14 / 14 done** |
| Open S1/S2 bugs | **0** |
| Layout score | *not measured* — no original screenshots in `replica/screens/` (not scraped; see below) |

Parity means it does the same job, not that it looks the same. Colour/layout is
ignored on purpose (rebrand changes it). The feature number is what a switcher
cares about: can a user do everything they could do on the original.

### By area (weakest first)
- gameplay 52.6 (9)  ← the gap
- library 81.8 (5)
- lobby 96.7 (6)
- marketing 100 (1), results 100 (2), reliability 100 (2), social 66.7 (2)

## Verdict: shippable core, a hair under the 80 bar

All 14 must-haves are done and there are no open S1/S2 bugs, so the core flow a
switcher needs works: create a room, share the code, phones join and become the
controllers, play 7 games, see results, rematch. Feature score is 79.8 — within
rounding of the 80 "shippable" line, and the shortfall is entirely `should`/
`could` niceties, not core.

**Not a straight copy:** zero ads, zero accounts, no licensed IP. It fixes the
two things real AirConsole players complain about most (ads interrupting play,
and the app wanting you to log in / watch trailers). See
`replica/entrepreneur.md` (pending) for the full gap research.

## Missing features, in build order

Must-haves: none.

Should (the gameplay gap — these are what make it feel finished):
1. **Solo / keyboard fallback on the big screen** (no) — today you need ≥2 phones to start any game because `playersMin ≥ 2` and there is no way to play alone.
2. **Pause menu on the big screen** (no) — no way to pause/stop a running game.
3. **Live score HUD** (partial) — each game draws its own; no shared component.

Could (polish):
4. **Share link / real QR** (partial) — the join link prefills the code, but the QR on screen is a decorative placeholder, not scannable. Swap in a real encoder.
5. Custom room rules — rounds / time limit per game (no).
6. Search in library, favorites, spectator mode, sound/music (all no).

Left out on purpose (not scored): ads, subscriptions, licensed partner titles,
Android TV / Fire TV native apps, accounts/cloud saves, NES emulator, ratings,
IAP.

## Behaviour differences

| flow | original does | clone does | verdict |
| --- | --- | --- | --- |
| Start a game | often gated by an ad / trailer | no ads at all | keep (clone's whole point) |
| Accounts / cloud saves | login, cross-device | ephemeral rooms, no login | keep (matches "no login" positioning) |
| Game catalog | licensed partner titles (Overcooked, Pac-Man…) | original genre-alikes in the same 7 genres | keep (legal); genre coverage is complete |
| Join by code | 4-letter code + QR | 4-letter code; QR link prefills the code on the phone | clone is slightly easier (no retyping) |
| Host role | screen is the console | screen is the console; phones are controllers | match |
| One person playing | some games playable solo | **needs ≥2 phones** (keyboard fallback missing) | **clone is worse** — build should #1 |
| Reconnect | resume after drop | resume mid-game, server replays last state | match |

The one place the clone is genuinely worse than the original is solo play — the
original can be played alone more easily. That is `should` #1 above.

## Layout diff

`replica/screens/` (original) is empty and was intentionally not filled by
scraping airconsole.com (its layout is trade dress and the app is a live
service). `replica/clone-screens/` has the clone's own captures
(S01-landing, S02-lobby+S05-library, S03-join). To score layout, drop
side-by-side originals into `replica/screens/` at the same viewports and run:

```
python3 imgdiff.py replica/screens/S07.png replica/clone-screens/S07.png --json > replica/diffs/S07.json
python3 parity.py replica/features.csv --visual replica/diffs/*.json --markdown > replica/parity.md
```

## Top 5 to build next

1. **Solo / keyboard fallback** (should, gameplay) — removes the ≥2-phone wall; the single biggest gap vs the original.
2. **Pause menu** (should, gameplay).
3. **Real QR encoder** (should, lobby) — makes the share/QR row a true `yes` and scanning actually work.
4. **Live score HUD** shared component (should, gameplay).
5. **Custom room rules** (could) — rounds / time limit.

Next step in the pipeline: `/replica-entrepreneur` (pick which of these real
users actually care about + a positioning angle), then `/replica-brand` →
`/replica-launch` → `/replica-deploy`. Or `/replica-build` to knock out the
should-tier gaps first.
