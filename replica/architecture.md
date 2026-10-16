# Architecture: GleeLounge (a rebuild of AirConsole's core features)

Replaces AirConsole's ads + Hero model with: every game free, zero ads, phones as controllers.
Final name: **GleeLounge** (picked in /replica-brand, 2026-10-16).

## Stack

| layer | choice | why |
| --- | --- | --- |
| web | Vite + React 18 + TypeScript + Tailwind | one SPA serves landing, big screen (`/console`) and phone (`/join`); no SSR needed for a real-time toy; tiny bundles matter on phone browsers |
| realtime | Socket.io (WebSocket + long-poll fallback) | rooms, reconnection with player resume, binary-free JSON messages are fine at this scale; falls back on flaky party Wi-Fi |
| server | Node 20 + Express | single deployable hosts the SPA build + the WS server; the big-screen client is authoritative for game logic, the server is a room registry + input relay |
| database | SQLite via better-sqlite3 (file), swappable to Turso | rooms are ephemeral and live in server memory — the DB only stores the static game catalog and finished match history; zero ops, one file, upgrade path to Turso/Postgres later without code change in the data layer |
| styling | Tailwind + CSS custom-property tokens | tokens filled in by replica-design |
| hosting | Fly.io or Render (both support long-lived WebSockets) | Vercel cannot host the Socket.io server; one region near the user, single instance (rooms are in-memory — scale-out would need Redis pub/sub later) |
| auth | none | rooms are ephemeral, no accounts per recon skip list; a player is a `playerId` (UUID issued on join, persisted in localStorage for reconnect) |
| payments / email / jobs | none | user wants no ads, no billing; room TTL cleanup runs on an in-process `setInterval` |

Why not Next.js: its serverless model fights long-lived WebSockets; one Express process is simpler and cheaper for a single-region game server.

## Rooms are memory, history is SQLite

`Room`, `Player`, live `Match` state and in-flight `InputEvent`s live in a
`Map<string, Room>` on the server. That is the whole trick for low latency:
no DB write on the input path. A crashed server loses open rooms (acceptable —
matches last minutes, reconnect window is short). Persistent tables:

- `games` — seeded catalog of our original mini-games (also bundled as a TS module so the client doesn't need a query for the grid)
- `matches` — one row per finished game
- `scores` — one row per player per finished match

## Schema

See `replica/schema.sql`. 3 tables. Access rules: none needed (no auth, no user data at rest beyond anonymous display names and scores — GDPR-trivial; a future `/delete-my-scores` route can hard-delete by `player_id`).

Hard constraints enforced in code, not SQL (memory state):
- room code: 4 uppercase letters, unique among live rooms, regenerate on collision
- room cap: 16 players max, per-game `players_min`/`players_max` gate before `start_game`
- input rate limit: per-player token bucket (~60 events/sec) to stop rogue clients flooding the relay

## API

### HTTP

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| GET `/` | landing page | anyone | — | HTML/SPA | S01 |
| GET `/console` | big screen: create room or resume as screen | anyone | `?room=CODE` | SPA route → S02 | F01 |
| GET `/join` | phone join flow | anyone | `?room=CODE` (from QR) | SPA route → S03 | F02 |
| GET `/api/games` | game catalog | anyone | — | `Game[]` | S05 |
| GET `/api/matches/recent` | last N finished matches (names + scores only) | anyone | — | `Match[]` | future stats strip |

No REST for room actions — all room mutations go over the socket (they need to push to other clients anyway).

### WebSocket protocol (`/ws`)

Client → server:

| event | payload | effect |
| --- | --- | --- |
| `room:create` | `{ name, avatarId }` | create room, join as host, ack with `{ code, playerId }` |
| `room:join` | `{ code, name, avatarId }` | join existing, ack `{ ok, playerId, roomState }` or `{ ok:false, reason }` |
| `room:leave` | `{}` | remove player, maybe promote host |
| `player:ready` | `{ ready }` | toggle ready in lobby |
| `player:emoji` | `{ emoji }` | broadcast reaction to room |
| `game:start` | `{ gameId }` | host only; validates min/max players; broadcasts `game:started` with seed |
| `game:input` | `{ type, payload }` | phone → relayed to big screen as `input:{ playerId, type, payload }` (rate-limited) |
| `game:state` | `{ patch }` | big screen → broadcast authoritative state patch (optional; most games broadcast full snapshots per frame budget) |
| `game:end` | `{ results }` | big screen ends match; server persists `matches` + `scores`, broadcasts `game:ended`, room → `results` |
| `game:lobby` | `{}` | host returns everyone to lobby from results |
| `screen:hello` | `{ code }` | the TV claims the screen role for a room (reconnect of the big screen) |

Server → client: mirror of the above plus `player:joined`, `player:left`, `room:state`, `input:{playerId,...}` (to screen), `error`.

QR code on S02 encodes `${origin}/join?room=CODE` as an SVG (client-generated, no external service).

### Jobs

| name | schedule | what it does |
| --- | --- | --- |
| room sweeper | every 60s | close rooms with no connected player for >15 min or lobby idle >2 h |

## The parts that bite

- **Latency:** input path is phone → WS → screen render. No DB, no extra hop. Throttle phone stick events to ~30 Hz with latest-wins coalescing on the client before emit; buttons emit immediately. Target <80 ms on LAN, best-effort on WAN.
- **Authoritative screen:** game logic runs in the big-screen tab (AirConsole's model). If the TV tab is backgrounded, browsers throttle `requestAnimationFrame` — the screen shows a "keep this tab visible" hint and games use a fixed-timestep accumulator so simulation doesn't explode when frames drop.
- **Reconnects:** phone stores `{ code, playerId, token }` in localStorage; on WS reconnect it sends `room:join` with the same id and the server reattaches instead of creating a duplicate. Screen reconnect uses `screen:hello`. Mid-game inputs during a screen blip are buffered client-side (last 100 events) and replayed on resume.
- **Code collisions + enumeration:** 4 letters = 456 976 combos; regenerate on collision; rate-limit `room:join` failures per IP (10/min) to stop code guessing.
- **Background tab throttling on phones** (controller side): phones sleeping mid-game — use `navigator.wakeLock` where available, and the disconnect banner (S10) otherwise.
- **Drawing pad data size:** strokes sent as simplified point arrays (RDP epsilon), batched every 100 ms, capped at 8 KB per batch — not raw 60 Hz canvas dumps.
- **Room state fan-out:** full `room:state` only on join/leave/start; during play only game traffic flows, to keep the wire small with 8+ phones.
- **SQLite concurrency:** single Node process, `better-sqlite3` synchronous — fine; never open a second writer.

## Build order

1. **Vertical slice (prove the stack).** Express + Socket.io + Vite SPA. Screens: S01 landing, S02 lobby with live code + QR + player list, S03 phone join, S04 phone ready. Tables: `games` seeded empty-ish. One throwaway game: **Reaction Duel** (tap when green — 2 phones minimum) end-to-end including S07 minimal + S09 minimal. Routes: all HTTP above + full WS protocol v1.
2. **Must-haves** (from features.csv):
   - Library S05/S06 with filters (genre, players, solo) over the seeded catalog
   - Games (original, one per controls_type to cover the widget set): **Word Sprint** (text pad), **Draw & Guess** (drawing pad), **Quiz Party** (tap grid), **Karts** (stick + buttons), **Bomber Arena** (dpad + button), **Simon Echo** (tap sequence)
   - S09 podium full flow + rematch; F03/F04 complete
   - Min/max player gating, host migration, reconnect (S10), room sweeper job
3. **Should-haves:** emoji bar, solo modes + keyboard fallback, pause menu, live HUD, room TTL tuning, player colors
4. **Could-haves:** search, favorites, custom rules, share links, sounds
5. **Fixes from replica-entrepreneur** once it has run.

Each milestone keeps the feature matrix `clone` column updated; replica-diff scores it.

## Games as plugins (internal contract)

Each game is a folder under `src/games/<slug>/` exporting:

```ts
export const game: GameDef = {
  id, slug, title, genre, playersMin, playersMax, hasSolo,
  description, cover: { emoji, gradient },
  controls: 'stick' | 'dpad' | 'text' | 'draw' | 'tapGrid' | 'reaction' | 'sequence' | 'triviaGrid',
  Screen: React.FC<ScreenProps>,   // big-screen renderer + game loop
  Controller: React.FC<CtrlProps>, // phone control layout (usually picks a shared widget)
  reducer: (state, action) => state, // pure step fn, seeded PRNG, runs on screen tab
}
```

The lobby imports the registry; adding a game is one folder + one registry line. The shared widget library (`Joystick`, `Dpad`, `TextPad`, `DrawPad`, `TapGrid`, `ReactionButton`, `SequencePad`, `TriviaGrid`) lives in `src/controllers/` — S08 is composed from these, so every future game is nearly free.
