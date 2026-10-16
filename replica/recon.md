# Recon map: AirConsole clone (web: big screen + phone controllers)

Scope: full platform loop — room codes, phone-as-controller, game library, playable original mini-games, zero ads, all games free.
For: the user's own product (party gaming platform, mobile-friendly, no ads).
Date: 2026-10-16

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | marketing site | https://www.airconsole.com/ | pitch: "online video game console, smartphones are the controllers" |
| 2 | games catalog (JSON dump) | https://www.airconsole.com/games | 235 game entries, categories pvp/coop/sport/card, tags, player counts |
| 3 | Google Play listing | https://play.google.com/store/apps/details?id=com.airconsole.controller | Starter Pack (free, 2p, ads) vs Hero (all games, no ads, one-for-all) |
| 4 | corp press page | https://corp.airconsole.com/airconsole-console-alternative | pricing history $4.99/mo, $23.99/yr; partner titles from Switch/PS4/Xbox |
| 5 | game landing pages | https://www.airconsole.com/play/card-games/word-bomb | per-game SEO pages with mode descriptions |
| 6 | help center | https://help.airconsole.com | report-a-game form only |
| 7 | Wikipedia | https://en.wikipedia.org/wiki/AirConsole | founded Zurich (N-Dream), smartphone-controller latency solved |

## Core loop

One person opens the big screen (TV/PC browser), gets a 4-letter room code; friends type the code on their phones and their phones become gamepads; the host picks a game from the library; everyone plays on the shared screen; results shown; back to lobby, switch games freely.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Landing / home | `/` | pitch + CTA "Start playing" + "How it works" | hero, 3-step explainer, game showcase strip, CTA | default |
| S02 | Console lobby (big screen) | `/console` after creating/joining as screen | show room code + QR, player list waiting, library to pick a game | big code display, QR, player avatars row, game grid, "start" | empty (no players), players joined, game launching |
| S03 | Controller join (phone) | `/join` or QR target | enter code, pick name + avatar, connect | code input (4 chars), name field, avatar picker, connect button | code invalid, connecting, connected |
| S04 | Controller lobby (phone) | after S03 | show "you're in", wait for host to start, ready toggle, emoji reactions | avatar card, ready button, room info | waiting, ready, host starting countdown |
| S05 | Game library (big screen) | `/console` library section, filter chips | browse all games, filter by genre / player count | game cards (cover, title, players, genre), filter chips, search | filtered empty, full grid |
| S06 | Game detail | click game card | preview: description, players, controls summary, Play button | cover, description, meta, Play CTA | default |
| S07 | In-game screen (big screen) | launched from S06 | render the active game world | canvas/stage per game, HUD, pause menu | playing, paused, round-transition |
| S08 | Controller in-game (phone) | auto-switched on join of a game | game-specific controls: buttons, joystick, text input, drawing pad, tilt | per-game control widgets | per-game states |
| S09 | Results / scoreboard | after game ends | ranks, scores, rematch or back-to-lobby | podium, score table, rematch button | default |
| S10 | Session ended / reconnect | dropped socket | rejoin with same code, resume state | reconnect banner, code re-entry | disconnected, resuming |

## Flows

```
F01 Host starts a session
    S01 -> S02 (code + QR visible)
    happy path clicks: 2 (Start playing -> Create room)
    edge: no players join (solo-play option), code collision (regenerate), host closes tab (room TTL)

F02 Friend joins from phone
    S03 (enter code + name + avatar) -> S04 (in lobby, ready)
    happy path clicks: 3
    edge: wrong code (shake + error), name taken (suffix), phone sleeps mid-join (resume), 17 players (cap at 8-16 per game)

F03 Host picks a game and everyone plays
    S02 library -> S06 detail -> S07 playing (+ S08 on each phone) -> S09 results -> back to S02
    happy path clicks: 3
    edge: player disconnects mid-game (AI/ghost or pause), game needs 4p but only 2 joined (min-player gate), rematch voted

F04 Switch game mid-session
    S07 pause -> S02 library -> new game
    happy path clicks: 2
    edge: unsaved scores of previous game discarded (show last results first)

F05 Solo play (single-player mode)
    S02 -> pick solo-capable game -> S07 with keyboard/one-phone controls
    happy path clicks: 2
    edge: game has no solo mode (hidden/disabled)

F06 Reconnect after drop
    S10 -> re-enter code -> resume at S04 or mid-game S07/S08
    happy path clicks: 2
    edge: room already closed (expired message), game already finished (jump to S09)
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Big code display | 4-letter mono, huge | idle, copying | S02 |
| QR code | SVG render of join URL | default | S02 |
| Player avatar chip | animal/emoji avatars, color per player | connected, ready, disconnected, host badge | S02, S04, S07 HUD, S09 |
| Code input | 4 auto-advancing cells | focused, filled, error, shake | S03 |
| Name input | text + randomize button | empty, taken, valid | S03 |
| Avatar picker | grid of avatars | selected | S03 |
| Game card | cover, title, players range, genre tag | hover, locked (never — all free), selected | S05, S06 |
| Filter chip | genre, player count, solo | active, inactive | S05 |
| Ready toggle | big phone button | on, off, disabled (starting) | S04 |
| Phone D-pad / joystick | virtual stick | idle, pressed | S08 (racing/action) |
| Phone action buttons | A/B, 4-face | pressed, cooldown | S08 |
| Phone text pad | keyboard input | typing, submitted, timeout | S08 (word games) |
| Phone drawing pad | canvas + colors | drawing, sent | S08 (drawing games) |
| Phone tilt control | deviceorientation | active, permission-prompt | S08 (some racing) |
| Score table | ranked rows | final, live | S07 HUD, S09 |
| Podium | 1st/2nd/3rd | animated | S09 |
| Countdown overlay | 3-2-1-GO | running | S07 start |
| Disconnect banner | reconnecting spinner | retrying, failed | S10 |
| Emoji reaction bar | 👍😂😮😢😡 | sent, cooldown | S04, S07 |

## Inferred data model

```
Room       id, code (4 letters unique), host_player_id, status (lobby | in_game | results),
           created_at, expires_at
           evidence: S02 code display, S03 join flow, F01/F02
           confidence: high

Player     id, room_id, name, avatar_id, color, is_host, is_ready, connected_at, disconnected_at
           evidence: S03 fields, S04 ready, S02 player list
           confidence: high

Game       id, slug, title, genre (party|quiz|word|drawing|racing|action|sports|board|puzzle),
           players_min, players_max, has_solo, description, cover_emoji/cover_color,
           controls_type (stick_buttons|drawing|text|tap_grid|trivia_grid|none)
           evidence: catalog JSON dump fields (name, category, players_min/max, stores tags)
           confidence: high

Match      id, room_id, game_id, started_at, ended_at, status (countdown|playing|finished),
           config (json: rounds, time_limit, custom rules)
           evidence: F03, S07
           confidence: high

Score      match_id, player_id, value, rank, meta (json: per-round breakdown)
           evidence: S09
           confidence: high

InputEvent player_id, match_id, seq, type (axis|button|text|draw|tap|tilt), payload (json), sent_at
           evidence: S08 real-time controls; the core latency-critical path
           confidence: high (design), payload shapes vary per game
```

Relationships: Room 1-n Player; Room 1-n Match; Game 1-n Match; Match 1-n Score; Player 1-n Score; InputEvent belongs to Player+Match.

## Feature matrix

See `features.csv`. Must: 14, should: 8, could: 6, skip: 8.

## Out of scope (cannot or should not be cloned)

- Licensed/partner game titles (Overcooked, Hot Wheels, Pac-Man, Tetris, UNO, Who Wants to Be a Millionaire, Trivia Crack, Death Squared, etc.) — we ship ORIGINAL mini-games in the same genres, never their code, art, or names.
- AirConsole's own trademarks, logos, brand name — clone gets its own name via /replica-brand.
- Their network of players, accounts, ratings DB — fresh data model.
- Android TV / Fire TV native apps — web only (phones + big-screen browser); TV apps later if wanted.
- Their ad-tech and Hero subscription billing — the user's product has NO ads and all games free; payment layer omitted entirely (can add later).
- NES emulator / ROM loading — legal risk, skip.

## Size

Screens 10, flows 6, entities 6. Hard parts: real-time phone↔screen sync (WebSockets, low latency input), building 10+ genuinely playable original mini-games each with custom phone controls, room lifecycle/reconnect. Size: **L** (multi-week build; platform + game engine + several games). Slice plan: vertical slice = lobby + 2 games first, then expand library.
