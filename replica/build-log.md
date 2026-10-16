# Build log — GleeLounge

## 2026-10-16 — scaffold + vertical slice + 7 games

- Scaffold: Vite + React 18 + TS + Tailwind + Express + Socket.io + node:sqlite. Typecheck clean (client + server).
- Design primitives built: Button, CodeInput, CodeDisplay, QRCode (stylized placeholder — not a real QR encoder; replaceable), AvatarChip, GameCard, FilterChip, ScoreTable, Podium, EmojiBar, DisconnectBanner, NameInput.
- Controller widgets: Joystick, Dpad, ActionButton, TextPad, DrawPad, TapGrid, SequencePad, ReactionButton.
- Server: in-memory rooms (4-letter codes, host migration, rate-limited inputs 60/s, 60s sweeper), persistent matches/scores via node:sqlite, REST `/api/games` + `/api/matches/recent`.
- WS protocol v1 complete: create/join/resume/ready/emoji/start/input/state/end/lobby/screen-hello.
- Screens S01–S10 all present (S10 as DisconnectBanner overlay; full-page room-gone fallback not built).
- Games (original, one per controls_type): Reaction Duel, Word Sprint, Draw & Guess, Quiz Party, Karts, Bomber Arena, Simon Echo.
- Smoke test `scripts/smoke.mjs` passes: create → join → start → input relay → end → persist.

## Known gaps / harder than it looked

- **Host is the console, not a player** (changed during replica-test, BUG-003): `room:create` no longer creates a player; the big screen authorises `game:start` via its `screen` socket role. The lobby shows `Players (0/16)` until phones join. This means there is no "host badge" among players — the console *is* the host. Min/max gating (BUG-005) now counts only phones.
- **Draw & Guess phrase leak:** the phrase goes out in `game:state` to every phone (drawer needs it; no per-player DM channel in protocol v1). Acceptable among friends; fix = targeted `game:dm` message.
- **Karts finish logic:** first-to-finish triggers end after 8s grace; players still racing get sorted by lap. Drift physics are minimal.
- **QR code is decorative** (deterministic pseudo-pattern, not scannable). Join-by-code works; swap in a real encoder lib when shipping.
- **No screenshots captured yet** into `replica/clone-screens/` (needs a headless browser pass — next: replica-test can drive it).
- Solo modes, pause menu, search: not started (should/could tier).
- `game:state` broadcast is untyped `unknown` everywhere — typed per-game patch schemas would catch drift. Quiz Party now ships `q`/`opts` in its patch (BUG-002); the other games still rely on shared client-side constants.

## Fixed during replica-test

- BUG-001 stylesheet 500 (import path), BUG-002 quiz question mismatch, BUG-003 host-as-player, BUG-004 card auto-select + modal overlay, BUG-005 min/max gating, BUG-006 a11y (main/heading-order/h1), BUG-007 "2–4" filter bound, BUG-008 dialog role, BUG-009 quiz early-finish, BUG-010 QR code not prefilled on the phone. All re-verified by the e2e suite (9/9 green, including `f07-phone-control` which proves the phone is the controller: scan link → code prefilled → type name → play). Full write-up in `replica/bugs.md`.
