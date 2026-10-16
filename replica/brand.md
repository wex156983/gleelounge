# Brand — GleeLounge

Final name for the AirConsole clone. Nothing launches under the original's identity.

## Name

**GleeLounge** — "glee" (great delight) + "lounge" (a social hangout space). A joyful
place where friends gather to play. 3 syllables, easy to spell and say.

Picked 2026-10-16 from 90+ candidates across 6 rounds of live checks (RDAP, iTunes
Search API, websearch, GitHub). The `.com` namespace was ~100% taken for short
invented words; "glee*" compounds were the first family with a full free portfolio.

### Candidates (abridged — full list in session logs)

20 initial: Kazoom, Shindig, CouchCode, Jamboree, Bloop, Ruckus, Frolic,
PlayCircle, PartyPad, SofaSync, TapDeck, JoyPad, Kaboom, Bonkers, Playzo,
Joyzo, Funzo, Zippy, Wombat, Hoedown.

Eliminated in rounds 1-3 (RDAP + websearch): all 20. Kazoom = kazoom.ai (AI
games, live). Shindig = shindig.com (events, since 2010) + shindig.tv (party
games). Jamboree = joinjamboree.com + App Store + Play Store. Playzo =
playzo.io + playzo.de (studio, since 2004). Every short invented word
(gathr, combly, pluno, quibo, glimbo, huzza, jubli, fizzo, mingo, bubbo, vexo,
zento, kazam, wizzo, gleeko, plixo, blixo, zumm, joyzo, funzo, partydeck,
joydeck, phoneparty) was registered on `.com`.

Rounds 4-6 found the "glee*" family free: gleeblast, gleezap, gleeshock,
gleesurge, gleesprint, gleedash, gleerush, gleeflash, gleefire, gleevolt,
gleearena, gleestage, glearcade, gleedeck, gleelounge, gleeport, gleecourt,
gleeparade, gleefiesta, gleecarnival, gleecircus.

### Finalists (checked 2026-10-16)

| Check | GleeLounge ✅ | GleeBlast | GleeParade |
|---|---|---|---|
| .com | AVAILABLE | AVAILABLE | AVAILABLE |
| .app | AVAILABLE | AVAILABLE | AVAILABLE |
| .gg | AVAILABLE | AVAILABLE | AVAILABLE |
| .party | AVAILABLE | AVAILABLE | AVAILABLE |
| .tv | AVAILABLE | AVAILABLE | AVAILABLE |
| iTunes Search API (US) | 0 results | 0 results | 0 results |
| GitHub handle | 404 (free) | — | — |
| Websearch (exact compound) | 0 matches | 0 matches | 0 matches |
| Trademark US/EU/CA/WIPO | **to run** | **to run** | **to run** |

Trademark databases (USPTO TSDR, EUIPO, WIPO Madrid) are JS apps, not
scrapeable via webfetch. Run them manually before filing.

Why not GleeBlast: "blast" is the default suffix for match-3 puzzle games
(EverBlast, Connect to Blast, Candy Blast) — reads as a single game, not a
platform. Why not GleeParade: 5 syllables; "parade" is heavily used by other
brands.

### Conflicts noted (not blockers)

"Glee" alone is crowded (Fox TV show, Glee Games solitaire, Glee chat app,
Glee events platform, Glee art-sharing app). None use the full compound
"GleeLounge". The compound is distinctive and available everywhere.

Competitors found in the space (none named Glee*): rumpus (GitHub, open
source, self-hosted), Aircade ($19.99 Play Store), PlayCloud Party Games,
PadlessBox, Pandemoni (App Store), Screens (App Store), Playcade
(playcade.party), Gaming Couch (gamingcouch.com), Couch Party Games
(couchparty.tv). All use phones-as-controllers + TV screen.

## Palette

Accent `#f72585` (hot magenta). AirConsole's brand colour is `#adee00`
(lime green) — magenta is the complementary hue, maximally distinct. Player
colours span the rainbow (`#ff6b6b` red, `#4dabf7` blue, `#51cf66` green,
`#fcc419` yellow, `#cc5de8` lavender, `#ff922b` orange, `#20c997` teal,
`#748ffc` periwinkle); magenta sits between player-5 (lavender) and player-1
(red) but is distinguishable from both.

`on-accent` is `#1a0508` (near-black), not white — dark text on hot magenta
gives 5.20:1 contrast (AA) and reads playful/candy, matching the "glee" vibe.
`accent-hover` `#ff4d94` is a lighter step (6.31:1 with on-accent).

Full contrast check: `python contrast.py replica/design/tokens.json` → 28
pairs, 0 failing AA.

## Logo brief (not commissioned — for future use)

Subject: a glowing magenta crescent arc (like a smile or a lounge couch
silhouette) over a tiny 4-letter room code in monospace. No mascots, no
pixel art, no controllers, no TVs, no AirConsole-style ring. Wordmark:
"Glee" in bold Fredoka, "Lounge" in lighter Fredoka, with the crescent
replacing the "G" crossbar. Works at 16px favicon size.

## Voice

Three words: **playful, warm, direct**.

Five do/don't pairs:

1. DO sound like a friend inviting you over. DON'T sound corporate or salesy.
2. DO lead with "everyone plays, no barriers". DON'T lead with features or specs.
3. DO write short, punchy sentences. DON'T write long explanations.
4. DO be encouraging and inclusive. DON'T be competitive or exclusionary.
5. DO celebrate being in the same room. DON'T talk about technology or hardware.

### Rewritten strings (10 most-seen)

| Where | Old | New |
|---|---|---|
| index.html `<title>` | CouchParty — play together on the big screen | GleeLounge — play together on the big screen |
| Landing hero sub | One screen, any number of phones, a whole library of party games. Free, no ads, no extra hardware — just everyone already holding a controller. | One screen. Everyone's phone. A whole library of party games. Free, no ads, no sign-up — just press play. |
| Landing CTA | Start a game on this screen | Start a game right here |
| Landing CTA | Join with your phone | Join from your phone |
| Landing footer | CouchParty — a party gaming platform. Not affiliated with any other console. | GleeLounge — a party gaming platform. Not affiliated with any other console. |
| Console idle | Open this page on your TV or laptop to host. | Open this on your TV or laptop — you're the host. |
| Console idle sub | This screen becomes the console. Friends join from their phones with the code. | This screen is the party. Friends join from their phones with the code. |
| Console idle CTA | Create a room | Start a room |
| Console lobby | Waiting for players to join… | Waiting for friends… |
| Console footer CTA | Create a room to start | Start a room to play |
| Join form | Enter the code shown on the big screen | Type the code on the big screen |
| Join CTA | Connect | Join the party |
| Join lobby | You're ready — waiting for the host to start… | You're in! Waiting for the host… |

Kept as-is (already direct and warm): "Your phones are the controllers.",
"Every game free, no ads", "Start playing", "I'm ready!", "Tap ready when you
are in!", "Rematch", "Back to lobby", game titles.

## Sweep config

`replica/brand.json`:

```json
{
  "avoid": ["AirConsole", "N-Dream"],
  "domains": ["airconsole.com", "ndream.com"],
  "colors": ["#adee00"]
}
```

Run: `python "C:\Users\ninja\.claude\skills\replica-brand\sweep.py" . --config replica/brand.json`

Nothing launches under the original's identity.
