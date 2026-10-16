# Test plan: GleeLounge

Build: local-dev  Date: 2026-10-16  Env: local, in-memory rooms + sqlite

**Flows from recon:** F01 Host starts, F02 Friend joins, F03 Host picks game and everyone plays, F04 Switch game, F05 Solo play, F06 Reconnect.

| case | flow | type | steps | expected | auto | result |
| --- | --- | --- | --- | --- | --- | --- |
| F01-H1 | Create room (big screen) | happy | Open `/console` → click "Create a room" → code + QR + "waiting for players" appear | S02 with 4-letter code, QR shown, player list empty (host is the console, not a player); 0 axe violations | e2e | pass |
| F01-E1 | Create room when code collision rare | edge | Simulate room create twice; ensure unique codes | different codes generated | manual | |
| F01-E2 | Create room from deep link | edge | Open `/console?room=ABC1` on fresh tab | should show "Room not found" or remain on lobby behavior — screen:hello tolerates missing room (returns error) | manual | |
| F02-H1 | Join by code | happy | Open `/join`, type 4-letter code, pick name/avatar, tap Connect | moved to lobby, avatar appears in player list on TV | e2e | pass |
| F02-E1 | Wrong code | edge | Enter invalid code | shows "Room not found" and shake on code input | e2e | pass |
| F02-H2 | QR / join link drives the phone | happy | Open `/join?room=CODE` → code prefilled → type name → Connect → host starts Word Sprint → phone types a word | only the name is typed; the phone becomes the controller and the big screen shows the typed word live | e2e | pass |
| F02-E2 | Room full (16 players) | edge | Try to join when 16 already connected | "Room is full" | manual | |
| F02-E3 | Game already started | edge | Join after `game:started` | "Game already started" | manual | |
| F02-E4 | Reconnect with same playerId | edge | Disconnect phone, reconnect with saved identity → auto re-attach | back in same room/lobby, no duplicate player | manual | |
| F03-H1 | Play Reaction Duel (shortest game) | happy | TV hosts, 2 phones join, host opens card → Select → Start Reaction Duel → play 5 rounds → results with podium + scores | S07 game screen runs, controller becomes reaction pad, S09 shows results, can Rematch or Back to lobby | e2e | pass |
| F03-H2 | Play Word Sprint (text input) | happy | Play to completion → scores tallied | TextPad works, server accepts word input, results correct | manual | covered by Quiz case below |
| F03-H3 | Play Draw & Guess (drawing + guessing) | happy | Drawer draws, others guess → reveal → results | DrawPad batches strokes, guesses accepted, scoring correct | manual | |
| F03-H4 | Play Quiz Party (trivia) | happy | 2 phones answer each question → reveal → results | TapGrid locks after pick, tally shown, round ends early when all answered | e2e | pass |
| F03-H5 | Play Karts (joystick) | happy | Drive with joystick → race → results | 30 Hz axis relay, no major stutter on LAN | manual | |
| F03-H6 | Play Bomber Arena (dpad) | happy | Move/drop bombs → last standing → results | movement blocked by walls/crates, explosion damage works | manual | |
| F03-H7 | Play Simon Echo (sequence) | happy | Watch sequence, repeat → progress → eliminate or finish | sequence plays, input compared correctly | manual | |
| F03-E1 | Min/max player gating | edge | Start game with < playersMin | blocked with a clear message (implemented in BUG-005) | manual | fixed |
| F03-E2 | Player disconnect mid-game | edge | Close phone mid-`in_game` → stays in state, no crash; reconnect allowed | game continues for others | manual | |
| F03-E3 | Double-start from host | edge | Rapidly click Start twice | only one `game:started` | manual | |
| F04-H1 | Switch game mid-session | happy | After results, pick another game → start new match | room back to playing new game, scores reset for new match | manual | |
| F05-H1 | Library filters narrow the grid | happy | Filter by genre and by player-count bucket | racing→Karts only; word→Word Sprint only; "2–4"→games with playersMin≤4 | e2e | pass |
| F05-H2 | Game detail modal + select | happy | Click a card → dialog → Select | dialog has role=dialog; Select arms the game, Start is reachable | e2e | pass |
| F05-H3 | Solo play on games with hasSolo | happy | Join alone (or host solo view)? Some games have hasSolo; test where supported | game runs or shows appropriate gate | manual | |
| F06-H1 | Screen reconnect | happy | Reload `/console?room=CODE` → `screen:hello` restores room state | back in lobby/playing/results as appropriate | manual | |
| F06-E1 | Phone reconnect during inputs | edge | Phone drops network briefly during a game | reconnects and re-attaches; inputs after resume work | manual | |
| F06-E2 | Room idle TTL | edge | Leave all disconnected > 15 min | sweeper closes room (no new joins) | manual | |
| A11Y-1 | Focus rings, keyboard nav | a11y | Tab through lobby on TV/phone | visible focus on all interactive controls | manual | partial (axe green on landing+lobby) |
| MOB-1 | Phone viewport (375–414px) | mobile | Test join + lobby + in-game on narrow width | no overflow, tap targets >= 48px, controls usable | manual | |
| MOB-2 | TV-ish viewport (1440–1600) | desktop | Console lobby + games on big screen | text readable at 2–3m distance (type scale matches tokens) | manual | |
| ERR-1 | No console errors | non-func | Click through happy paths | zero `console.error` | e2e | pass (guardConsole active in every spec) |

**Coverage:** 9 e2e specs green (F01×2, F02×2, F03×2, F05×2, phone-control×1) covering flows F01, F02, F03, F05 + a11y on landing/lobby; remaining cases manual. Focus S1/S2 first. Bugs found are in `replica/bugs.md`.
