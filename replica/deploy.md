# Deploy checklist: GleeLounge

Date: 2026-10-16  Commit: n/a (no git repo yet — init one before you push)  Go from user: **yes — Render** (pending the user's GitHub + Render + domain accounts)

## Preflight (all must pass)

- [x] e2e suite green: **26 passed / 26** (`npx playwright test`, 2026-10-16)
- [x] no open S1 or S2 bugs — see `replica/bugs.md`; every S1/S2 fixed and re-verified (BUG-001…003 were S2, all fixed; BUG-004…010 are S3/S4, fixed or tracked)
- [x] parity: all must-haves done (**14/14**), feature score **79.8** (`parity.py replica/features.csv`)
- [x] rebrand sweep clean (`sweep.py` exit 0) — "Clean. Nothing of the original's name, domain or colours found."
- [x] store listing passes (`listing.py` exit 0) — **0 errors, 0 warnings**
- [x] production build passes — `npm run build` → `dist/` built (index 2.09 kB, css 22 kB, js 293 kB gz ≈ 92 kB); icons + OG copied into `dist/`
- [x] privacy policy and terms live, every processor listed — `/privacy` and `/terms` (`src/screens/Legal.tsx`); processors named: host, Google Fonts, privacy-friendly analytics (if on), error tracking (if on); Stripe called out as not-yet-live. **Template only — have a lawyer review before launch.**
- [x] account deletion works — **N/A by design**: no accounts exist. Privacy policy states the reconnect token can be cleared via browser site data.
- [x] favicon, titles, OG image, app icon are yours — `public/favicon.svg`, `public/apple-touch-icon.png`, `public/og.png` (rendered from HTML via Playwright, `scripts/make-assets.mjs`); `index.html` has title, meta description, og:* and twitter:* tags. Sweep confirms zero original branding.

**Preflight is green. Nothing here blocks the deploy.**

## Production — Render

Host = **Render** (user's pick). All account, domain and payment steps are done by
the **user**; Claude only names the values and the commands. Repo already contains
`render.yaml` (Blueprint) and `.env.example`.

### A. Push the repo (user + Claude)
- [ ] `git init && git add -A && git commit -m "GleeLounge"` — **Claude runs this**
      (`.gitignore` excludes `node_modules/`, `dist/`, `data/`, `*.db`).
- [ ] User creates a **GitHub repo** (private is fine) and pastes its URL, or pushes
      themselves.
- [ ] `git remote add origin <URL> && git push -u origin main` — **user pastes URL**;
      Claude must never enter credentials.

### B. Render service (user)
1. Render Dashboard → **New → Web Service** → connect the GitHub repo.
2. Name: `gleelounge`. Runtime: **Node**. Branch: `main`.
   The `render.yaml` Blueprint prefills:
   - Build: `npm ci && npm run build`
   - Start: `npm start` (runs `cross-env NODE_ENV=production tsx server/index.ts`)
   - Health Check Path: `/api/games`
3. **Instance Type: Starter** (paid, ~$7/mo). **Free** tier has no persistent disk and
   cold-starts after inactivity — bad for a live room of friends.
4. **Disks**: the Blueprint attaches a 1 GB disk at `/var/data` and sets
   `DATA_DIR=/var/data`, so the SQLite file survives redeploys. Confirm it shows.
5. Env vars from the Blueprint: `NODE_ENV=production`, `DATA_DIR=/var/data`.
   `PORT` is injected by Render and read by the server automatically.
6. Leave **Instances = 1** (rooms are in memory; scaling out needs sticky sessions).
7. Deploy. Wait for the health check to go green, then open the Render URL
   (`https://gleelounge-xxxx.onrender.com`).

### C. What does NOT need setup
- **Migrations** — none; schema is created + seeded on boot (`seedGames`).
- **Stripe** — not live; the product is free with no IAP. Nothing to switch.
- **OAuth** — none (no sign-in).
- **Email** — none at launch. Add SPF/DKIM/DMARC only when receipts/waitlist ship.

### Single-instance note

Rooms live **in memory**, so keep this at **one instance** (or add sticky sessions +
shared room state before scaling out). A restart wipes open rooms — acceptable for
launch, but keep it a single service, not an autoscaled group.

## Domain

User buys the domain (`.com/.app/.gg/.party/.tv` were AVAILABLE for GleeLounge on
2026-10-16 — `replica/brand.md`). Then attach it on Render:

1. Render Dashboard → the service → **Settings → Domains/HTTPS → + Add Domain**.
   Add **both** the apex (`gleelounge.com`) and `www`.
2. Pick one canonical host and redirect the other (Render handles this once you set
   a primary). Recommend: apex → redirect to `www`, or the reverse.
3. At the registrar, add the records Render shows (values are generated per-service —
   **copy them exactly, do not guess**):

| type | host | value |
| --- | --- | --- |
| CNAME | www | `gleelounge-xxxx.onrender.com` (service hostname Render displays) |
| A | @ | the apex IP Render shows, if it gives one instead of a CNAME |

Notes:
- HTTPS is automatic once the domain is attached and DNS propagates; verify the padlock.
- DNS can take a few minutes to an hour to propagate.
- **SPF/DKIM/DMARC** — only needed once email is sent (see above). Start DMARC at
  `v=DMARC1; p=none; rua=mailto:you@gleelounge.com`, then tighten to `quarantine`.

## Watch

- [ ] **Error tracking** — add Sentry (or the host's built-in) to both clients
      (`Sentry.init` in `main.tsx`) and the server. The #2 complaint about the
      original is crashes, so we get to prove we don't have them.
- [ ] **Uptime checks** — monitor `/` and `GET /api/games` (the health-ish endpoint
      the client polls) every minute.
- [ ] **Analytics** — privacy-friendly and cookieless (Plausible or Umami), so no
      cookie banner is needed. Events to track: room created, phone joined, game
      started, game finished, reconnect, room closed.
- [ ] **Logs** kept, with an alert to the user's email or phone.
- [ ] **Core flow done on the live site**, desktop and phone, by hand: create room →
      scan QR / type code → join → pick a game → play → one phone locks → rejoin
      mid-round. The reconnect beat is the differentiator; verify it on a real
      iOS + Android phone.

## Store submission (later, optional)

`listing.json` is green (0 errors). Before uploading, re-check both consoles for
current screenshot sizes, and take screenshots that show **the games and the
reconnect banner** — original UI, not a clone skin (App Review Guideline 4.1). Age
rating 13+; privacy labels / data safety form to match "nothing linked to identity".
Review notes: give the reviewer a demo room they can drive from two browser tabs if
they have no second phone.

---

**Status:** preflight green, go received (Render). Next actions:
1. Claude runs `git init/add/commit`; user creates the GitHub repo and pastes the URL.
2. User follows the Render steps in **Production — B** and attaches the domain (**Domain**).
3. User pastes the Render URL back here → live URL gets recorded.

_Note:_ `npm install` reports **11 vulnerabilities (5 moderate, 6 high)**, mostly in
dev/build tooling (esbuild, playwright). Run `npm audit` after launch and consider
`npm audit fix` — review for breaking changes before forcing.

Live URL: _pending_.
