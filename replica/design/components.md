# Components — GleeLounge design system

Tokens: `tokens.json` / `tokens.css` / `tailwind.config.ts`. Dark-first. Accent is placeholder (replica-brand swaps values).
Two viewing distances: **TV** (2–4 m, big type, high contrast) and **phone** (hand, 56 px min tap targets).
Player chips always render dark text (`bg`) on a `player-*` background — never light-on-player.

Shared primitives live in `src/components/ui/`. Controller widgets live in `src/controllers/`. Screens compose them; screens never define raw colors.

---

## UI primitives (`src/components/ui/`)

### Button
- variants: `primary` (bg accent, text on-accent), `secondary` (bg surface-hover, border, text), `ghost` (transparent, text), `danger` (bg danger, text on-danger), `cta` (primary + glow shadow, used for "Start playing")
- sizes: `sm` h-32 px-3 text-sm · `md` h-40 px-4 text-base · `lg` h-48 px-6 text-lg · `tv` h-64 px-8 text-xl (big-screen targets)
- states: default, hover (accent-hover / surface-hover), active (scale 98%), focus-visible (2px ring accent, offset 2), disabled (opacity 40, no pointer), loading (spinner replaces icon, label kept for SR)
- a11y: real `<button>`, visible focus, loading keeps accessible name
- used on: S01, S02, S03, S04, S06, S09

### CodeDisplay
- the 4-letter room code, huge mono, letter-spaced, glow shadow, optional copy button
- sizes: `tv` text-code (120px), `phone` text-display-lg
- states: idle, copied (checkmark 2 s), regenerating
- a11y: live region announces code; copy is a real button with feedback
- used on: S02

### QRCode
- client-generated SVG of `${origin}/join?room=CODE`, white modules on transparent (dark bg), quiet zone, fallback text "or go to /join and enter CODE"
- states: default
- used on: S02

### AvatarChip
- circular avatar (emoji or initial) on `player-N` bg with dark text, name label, optional host crown 👑 and ready check ✓
- sizes: `sm` (lobby list), `md` (HUD), `lg` (results podium)
- states: connected, ready, disconnected (grayscale + opacity 50 + broken-link icon), host
- a11y: name always visible or in `aria-label`
- used on: S02, S04, S07 HUD, S09

### CodeInput
- 4 auto-advancing single-char cells, mono uppercase, paste-friendly
- states: focused cell (ring accent), filled, invalid (danger border + shake 300 ms), disabled
- a11y: single hidden input semantics or `aria-label="Room code"` per cell; error announced via `role="alert"`
- used on: S03

### NameInput
- text field + randomize (dice) button, maxLength 12
- states: empty (CTA disabled), valid, taken (server says name exists → hint "try adding a number")
- used on: S03

### AvatarPicker
- grid of 8×N emoji avatars, selected = accent ring
- keyboard: arrow grid nav, Enter selects
- used on: S03

### GameCard
- cover block (gradient + big emoji), title, players range "2–6", genre chip, solo badge if hasSolo
- states: default, hover (lift + border accent), focus-visible, selected (ring accent)
- used on: S05, S06

### FilterChip
- pill toggle: genre list (`All Party Quiz Word Drawing Racing Action Sports Board Puzzle`) + "Solo" + player-count buckets
- states: inactive (surface, text-muted), active (accent bg, on-accent)
- used on: S05

### Countdown
- full-screen 3 → 2 → 1 → GO on TV, big display-lg type, per-beat pop animation
- used on: S07 game start

### ScoreTable
- ranked rows: rank, AvatarChip sm, name, value right-aligned; leader highlighted
- variants: `live` (during game HUD, compact) · `final` (results, with medal on top 3)
- used on: S07 HUD, S09

### Podium
- 2nd / 1st / 3rd blocks sorted by height, confetti burst on mount (1st place), AvatarChip lg
- states: default, animating in
- a11y: ordered list for SR ("1st place, Ana, 320 points")
- used on: S09

### DisconnectBanner
- fixed top bar: spinner + "Reconnecting…" → success (green flash 1 s, hides) or failure ("Couldn't reconnect — tap to retry")
- used on: S10 (overlays any screen)

### EmojiBar
- row of 6 reactions 👍 😂 😮 😢 😡 🎉, tap = burst animation on TV next to player chip, 3 s cooldown per player
- states: default, cooldown (dimmed + ring countdown), burst
- used on: S04, S07

### PauseMenu (TV)
- overlay: Resume / Change game / End session; keyboard Esc toggles
- used on: S07

### PlayerList
- horizontal wrap of AvatarChip sm on S02, with "waiting for players…" empty state (pulsing controller icon) and full state (dimmed + "room full" at cap)
- used on: S02

### GameGrid
- responsive grid: TV 4–5 cols, desktop 3, phone 2; empty state when filters match nothing ("No games match — try clearing filters")
- used on: S05

---

## Controller widgets (`src/controllers/`)

All phone widgets: min 56 px touch targets, `touch-action: none` on steers, safe-area padding, emit at ≤30 Hz for continuous (latest-wins coalesce client-side) and immediately for discrete presses.

### Joystick (`controls: stick`)
- virtual stick base 120 px, thumb 56 px, returns to center on release, emits `{x, y}` in [-1, 1]
- states: idle, pressed (glow), clamped
- used: Karts, racing games

### Dpad (`controls: dpad`)
- 4 arrow zones + optional center, multi-touch capable, emits `{up, down, left, right}` bools
- used: Bomber Arena, platformers

### ActionButtons
- 1–4 face buttons (A/B/…) or a single big action; press emits discrete event
- used: Bomber Arena (bomb), platformers (jump)

### TextPad (`controls: text`)
- full-width input (native keyboard) + submit; word games get letter hint strip; live char count; 60 s round timer mirrored from screen
- states: typing, submitted (locked, "waiting for others"), timeout
- used: Word Sprint

### DrawPad (`controls: draw`)
- canvas (device pixel ratio aware), 6 colors + eraser, undo stroke, clear; strokes RDP-simplified, batched every 100 ms, ≤8 KB/batch
- states: drawing, sent ("locked in"), waiting
- used: Draw & Guess

### TapGrid (`controls: tapGrid`)
- 2×2 / 2×3 answer buttons, locks after first tap (per round), shows chosen highlight
- used: Quiz Party

### ReactionButton (`controls: reaction`)
- one giant button ("TAP!"), arms/disarms per round from screen broadcast; first-tap-wins logic on screen
- used: Reaction Duel

### SequencePad (`controls: sequence`)
- 4 colored pads (Simon), input phase replays sequence then accepts taps; wrong tap = buzz state
- used: Simon Echo

### TriviaGrid — alias of TapGrid with A/B/C/D labels (kept separate for future media variants)

### TiltControl (optional, future)
- `deviceorientation` gamma/beta → axis; requires permission button on iOS; off by default (joystick is primary)

---

## Screen composition notes

| screen | composition |
| --- | --- |
| S01 Landing | hero (display-lg headline, cta Button tv) + 3-step explainer cards + GameCard marquee strip + footer |
| S02 Console lobby | header (logo + room code small) · CodeDisplay tv + QRCode + PlayerList · GameGrid + FilterChips (host only starts) · "waiting for players" empty |
| S03 Join (phone) | CodeInput + NameInput + AvatarPicker + primary Button "Connect" + error states |
| S04 Controller lobby (phone) | AvatarChip lg self · room info · Ready Button lg (toggles) · EmojiBar · "waiting for host" spinner |
| S05 Library (TV) | FilterChip row + GameGrid; clicking card → S06 modal or page |
| S06 Game detail | cover, description, players meta, controls summary icon row, Play Button tv |
| S07 In-game (TV) | game stage (full viewport) · top HUD (round timer, live ScoreTable compact) · PauseMenu on Esc · end → S09 |
| S08 Controller in-game (phone) | swaps to the game's controls widget + mini status strip (score, timer, round) |
| S09 Results | Podium + ScoreTable final + "Rematch" primary + "Back to lobby" secondary |
| S10 Reconnect | DisconnectBanner over whatever screen is underneath; full-page fallback if room gone ("Room closed — start a new one") |

## Motion rules

- UI transitions: `fast` 120 ms for hover/press, `base` 200 ms for state swaps, `slow` 320 ms for overlays/modals
- Countdown beats: 1 s per number with pop (scale 0.8→1) + glow flash
- Score changes: number rolls up, chip flashes success 150 ms
- Emoji burst: scale-in 120 ms, float up 1.2 s, fade
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables floats/confetti/rolls, keeps opacity only

## A11y floor

- Every interactive element keyboard-reachable on TV side (host may use keyboard); phone side is touch-primary but buttons are real `<button>`s
- Focus ring: 2 px accent, offset 2 px, everywhere
- Room code: `aria-live="polite"`; join errors `role="alert"`
- Results: semantic ordered list, not just visual podium
- Color never sole signal (ready = check icon + color; disconnected = icon + grayscale)
