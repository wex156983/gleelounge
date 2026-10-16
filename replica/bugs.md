# Bug report — GleeLounge

Build: local-dev  Date: 2026-10-16  Env: local (Vite :5173 + Express/Socket.io :3001, in-memory rooms + sqlite)
Scope: replica-test pass over flows F01–F05 (e2e) plus a11y. All S1/S2 below are fixed and re-verified by the e2e suite (8/8 green).

---

### BUG-001: App renders with no CSS — stylesheet 500s

- Severity: S2
- Flow / case: F01-H1 (blocks everything)
- Screen: all
- Build: local-dev  Browser / device: Chrome, 1440px

Steps
1. `npm run dev`, open `/console`.
2. Look at the network tab / rendered page.

Expected: Tailwind styles applied.
Actual: `GET /src/styles.css` returned 500; the whole app was unstyled (every e2e test failed here first).
Evidence: e2e run 1 — `500 on http://localhost:5173/src/styles.css`; console error from guardConsole.
Suspected cause: `src/styles.css` had `@import '../../replica/design/tokens.css'` — one directory level too high from `src/`.
Status: fixed — changed to `@import '../replica/design/tokens.css'`.

---

### BUG-002: Quiz Party phones show the wrong question and options

- Severity: S2
- Flow / case: F03-H4 / F03-H2
- Screen: S08 (controller) vs S07 (screen)
- Build: local-dev  Browser / device: Chrome, phone 390px

Steps
1. Host starts Quiz Party with ≥2 phones.
2. Screen shows question #1 from the RNG-shuffled pool; look at any phone.

Expected: the phone shows the same question text and same 4 options, in the same order.
Actual: the controller did `QUESTIONS[patch.qIdx]` against its own copy of the static bank, but the screen picks questions from a shuffled `qs` pool. So the phone showed a *different* question and its answer index referred to the wrong option list → answers/scoring were wrong.
Evidence: code inspection `src/games/quiz-party/index.tsx` (Controller used `const q = QUESTIONS[patch?.qIdx ?? 0]`); introduced by the shuffle in Screen `qs` memo.
Suspected cause: question data not part of the `game:state` patch; controller assumed shared ordering.
Status: fixed — added `q` and `opts` to the `Patch` and all `sendState` calls; controller now renders `patch.q` / `patch.opts`.

---

### BUG-003: Big-screen host was counted as a player but had no controller

- Severity: S2
- Flow / case: F01-H1, F03-H1, F03-H2
- Screen: S02 (lobby) / all games
- Build: local-dev  Browser / device: Chrome, 1440px

Steps
1. Host creates a room on the TV.
2. Read the lobby player list; start a game.

Expected: the person at the big screen is the console/host, not a player. Players are the phones.
Actual: `room:create` added the host as a player (`isHost: true`). The host appeared in the player list and in every game (podium/HUD) with score 0 forever, could never send input, inflated the player count for min/max gating, and prevented "round ends when everyone answered" from ever firing in Quiz Party. The person at the screen also had no way to play.
Evidence: `server/rooms.ts createRoom` created a player; e2e F03 with a single phone produced a 2-player game where the host could never act.
Suspected cause: host modelled as a player instead of a screen role.
Status: fixed — `createRoom` no longer creates a player (`hostId`/`screenSocketId` = the screen socket); `startGame` authorises on `role === 'screen'`; lobby now honestly shows `Players (0/16)` + "Waiting for players to join…". Lobby header promoted to `<h1>` so the screen still has a top-level heading.

---

### BUG-004: Clicking a game card opened the detail modal and selected the game at the same time

- Severity: S3
- Flow / case: F03-H1
- Screen: S05 (library)
- Build: local-dev  Browser / device: Chrome, 1440px

Steps
1. In the lobby, click a game card.
2. Try to press "Start …".

Expected: the card opens a detail dialog; choosing "Select" arms the game, closing the dialog, then Start is reachable.
Actual: the card click both opened the dialog *and* set the selected game, so the modal overlay sat on top of the "Start" button — the click was intercepted.
Evidence: e2e F03-H1 first run — click on Start timed out because the dialog overlay covered it.
Suspected cause: card `onClick` called `setSelectedGame` and `setShowDetail` together.
Status: fixed — card `onClick` only opens the dialog; selection happens via the dialog's "Select" button. Dialog now has `role="dialog"` + `aria-modal` (see BUG-008).

---

### BUG-005: Starting a game ignored min/max player counts (F03-E1)

- Severity: S3
- Flow / case: F03-E1
- Screen: S02 (lobby)
- Build: local-dev  Browser / device: Chrome, 1440px

Steps
1. Have fewer players than a game's `playersMin` (e.g. 1 phone, Reaction Duel needs 2).
2. Host presses Start.

Expected: start is blocked with a clear message.
Actual: `startGame` started with any number of players; no gating.
Evidence: code inspection `server/rooms.ts`; test-plan F03-E1 marked "currently partial".
Suspected cause: gating never implemented.
Status: fixed — `startGame` validates connected players against `GAMES.meta.playersMin/Max` and emits `error`; Console surfaces it (`role="alert"`).

---

### BUG-006: Accessibility violations on landing and lobby (axe)

- Severity: S4
- Flow / case: F01-H1, F01-H1b (A11Y-1)
- Screen: S01 (landing), S02 (lobby)
- Build: local-dev  Browser / device: Chrome, 1440px

Steps
1. Run axe (`@axe-core/playwright`) on `/` and on the console lobby.

Expected: zero violations.
Actual: landing — `landmark-one-main` (no `<main>`), `region` (steps outside a landmark), `heading-order` (h1 → h3). Lobby — `page-has-heading-one` (no h1).
Evidence: e2e F01-H1 / F01-H1b axe assertion output.
Suspected cause: missing `<main>`/heading structure.
Status: fixed — landing content wrapped in `<main>`, step headings h3 → h2; lobby brand switched to `<h1>`. axe now reports zero violations on both.

---

### BUG-007: Library "2–4" player filter showed almost nothing

- Severity: S3
- Flow / case: F05-H1
- Screen: S05 (library)
- Build: local-dev  Browser / device: Chrome, 1440px

Steps
1. Open the library, click the "2–4" filter chip.

Expected: games playable with a 2–4 person group (i.e. `playersMin <= 4`).
Actual: the bucket tested `playersMax <= 4`, which excludes every game in the catalog (all have `playersMax >= 6`) → empty grid.
Evidence: e2e F05 first run — expected Karts/Bomber Arena, found none.
Suspected cause: wrong bound in the bucket predicate.
Status: fixed — bucket predicate is now `playersMin <= 4`.

---

### BUG-008: Game detail modal was not exposed as a dialog

- Severity: S4
- Flow / case: F05-H2
- Screen: S05 (library)
- Build: local-dev  Browser / device: Chrome, 1440px

Steps
1. Open a game's detail modal.
2. Inspect roles / try to scope assertions to it.

Expected: an element with `role="dialog"`, `aria-modal="true"`, an accessible name.
Actual: plain `<div>`; the title `<h2>` collided with each card's `<h3>` under strict locators.
Evidence: e2e F05-H2 strict-mode violation (h2 vs h3 "Word Sprint").
Suspected cause: modal markup lacked dialog semantics.
Status: fixed — modal root is `role="dialog" aria-modal="true" aria-label={title}`; specs scope to `getByRole('dialog')`.

---

### BUG-009: Quiz Party waited the full 20s per round even when everyone had answered

- Severity: S3
- Flow / case: F03-H4
- Screen: S07/S08
- Build: local-dev  Browser / device: Chrome

Steps
1. Start Quiz Party; have all players answer immediately.

Expected: the round ends shortly after the last answer (snappy reveal).
Actual: the round ran the full `ANSWER_SECONDS` (20s) timer before revealing — up to ~2 min for 5 rounds.
Evidence: e2e F03-H2 first run timed out at 60s mid-game.
Suspected cause: reveal only triggered by the countdown hitting 0.
Status: fixed — added an effect that finishes the round ~700ms after all players answer (also removes the earlier dependence on the host being a player, see BUG-003). Quiz e2e now completes in seconds.

---

### BUG-010: Scanning the QR did not prefill the room code on the phone

- Severity: S3
- Flow / case: F02-H1 / phone-control
- Screen: S03 (join form)
- Build: local-dev  Browser / device: Chrome, phone 390px

Steps
1. Big screen shows the room code + QR; the QR points at `/join?room=ABCD`.
2. Open that link on a phone.

Expected: the four code cells are already filled — the person only types their name and taps Connect.
Actual: `CodeInput` ignored the `?room=` value, so the cells were empty and the code had to be retyped even after scanning.
Evidence: `src/components/ui/CodeInput.tsx` had no prop to seed the code; `Join.tsx` never passed `params.get('room')` into the input.
Suspected cause: component had no `initial`/`value` prop; the code only lived in the parent's state.
Status: fixed — added an `initial` prop to `CodeInput` (seeds the cells and fires `onComplete`), and `Join.tsx` passes `params.get('room')`. Verified by new e2e `f07-phone-control.spec.ts` (asserts the prefilled cells, then that the phone drives the game).

---

## Notes / decisions from testing

- Host-is-not-a-player is a deliberate model change (BUG-003). It contradicts the original `build-log.md` line "Player list with avatars and host badge" — there is no host badge now; the console itself is the host. `replica/features.csv` should be read with that in mind.
- QRCode remains a decorative placeholder (not scannable) — expected, tracked in build-log.
- Untested here (manual): S01 landing pixel parity, MOB-1/2 viewports, F04 switch-game, F06 reconnect, Karts/Bomber/Simon play-throughs, room-full (F02-E2), game-already-started (F02-E3).
