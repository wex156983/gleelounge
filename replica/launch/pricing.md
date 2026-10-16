# Pricing — GleeLounge

Read 2026-10-16. Prices change; re-check the sources before launch.

## What the original charges (and the alternatives)

| Service | Price | What you get | Source (read 2026-10-16) |
|---|---|---|---|
| AirConsole — Starter Pack | **$0** | A rotating selection of free games, **max 2 players**, with ad breaks | https://apps.apple.com/us/app/airconsole/id1017688554 |
| AirConsole Hero — monthly | **$7.99/mo** | All 170+ games, unlimited players, no ad breaks, one Hero covers everyone | App Store US in-app purchases; https://www.airconsole.com/hero |
| AirConsole Hero — yearly | **$23.99/yr** | Same as monthly (in-app purchase tier shown in the App Store) | App Store US in-app purchases |
| AirConsole Hero — lifetime | **$29.99** one-time | Same perks, one payment | App Store US in-app purchases |
| Jackbox Party Pack 12 | **$29.99** one-time | 5 games, 2–8 players, phones as controllers, one pack | https://www.jackboxgames.com/ ; https://store.steampowered.com/publisher/jackboxgames/lists/ |
| Jackbox Party Pack (older) | **$24.99** one-time | 5 games per pack; packs don't share games | https://www.jackboxgames.com/party-pack |
| poyo.tv | $0 | 17 games, 2–10 players, browser, no sign-up | https://poyo.tv/party-games |
| phonesout.games | $0 | 106 games, browser, no account | https://www.phonesout.games/ |
| party.games | $0 | Browser party games, phones as controllers | https://party.games/ |

Note the App Store lists several Hero tiers side by side ($2.99, $4.99, $11.99,
$17.99, $23.99, $29.99 lifetime). The headline consumer price is **$7.99/month**;
the yearly and lifetime tiers are the cheap-per-month options.

## What reviewers said about price and billing

From `replica/feedback.md` (310 reviews, 273 rated):

| Theme | Reviews | Avg stars | Sample complaints (verbatim, in `feedback.md`) |
|---|---|---|---|
| Price and paywalls | 51 | 2.4 | "The free games are fun, but 90% of them cost money to play, and you need to spend money to play with more than 3 players!" |
| Billing, cancelling and refunds | 18 | **1.4** | "I cancelled the subscription at least 5 different times and I'm still getting charged!!!" |
| Ads | 15 | 2.7 | "But they added ads that play IN THE MIDDLE OF GAMES." |

The one-time-purchase ask appears by name: "there should be an option of a one
time fee instead of only a subscription" (Google Play 2★), "Make the hero
exclusive a one time payment for the love of god. NOBODY LIKES SUBSCRIPTIONS"
(App Store 1★). Billing is the single lowest-rated theme (1.4★).

## The model

**The product is free. Paid tiers change nothing about access.** No game, no
player slot and no feature is ever behind a paywall. This is the whole point of
the angle — charging for games would recreate the original's top complaint.

Three tiers, named by who they are for:

| Tier | Who it's for | Price | Includes |
|---|---|---|---|
| **Free** | Everyone | $0 | All games, up to 8 players, no ads, no account, no install. The entire product. |
| **Patron** | People who want to keep it free for everyone | $14/yr, or $29 once (lifetime) | A supporter badge, your name in the credits, early access to new games. **Does not unlock any game** — those are already free. |
| **Host Kit** | Teachers, offices, cafés who host often | $29 once | Custom room code, saved game playlists, a printable QR poster for the wall. One-time. |

Rules baked into the model so the billing complaints can never happen here:

- No subscription is required to use anything. Free is the full product.
- The only recurring option (Patron annual) cancels with one click from a link in
  every renewal email. No phone call, no maze.
- A renewal reminder email goes out 7 days before any renewal. No silent charges.
- No per-seat or per-player pricing. Ever. Adding friends is free.
- Refunds honoured on request within 30 days, no interrogation.

## Stripe products and prices to create (the user creates them)

| Product | Type | Price | Env var suggestion |
|---|---|---|---|
| GleeLounge Patron — annual | Recurring, yearly | $14.00/year | `STRIPE_PRICE_PATRON_ANNUAL` |
| GleeLounge Patron — lifetime | One-time | $29.00 | `STRIPE_PRICE_PATRON_LIFETIME` |
| GleeLounge Host Kit | One-time | $29.00 | `STRIPE_PRICE_HOST_KIT` |

Checkout links only; the Free tier never touches Stripe. Add a Customer Portal
config so Patron annual subscribers can cancel themselves.

## Launch recommendation

Ship **Free only** at launch. The paid tiers are a later add once there are
people who ask how to support it. Leading with "free, and it stays free" is worth
more than early Patron revenue, and it keeps the launch message identical to the
product.
