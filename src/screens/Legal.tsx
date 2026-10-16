import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

// Placeholder legal copy. Not legal advice — have a lawyer review before launch.

function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-full">
      <header className="max-w-layout mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="text-xl font-bold">
          🎮 <span className="text-accent">Glee</span>Lounge
        </Link>
        <Link to="/">
          <Button size="md" variant="secondary">
            Back home
          </Button>
        </Link>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-display font-bold">{title}</h1>
        <p className="mt-2 text-text-muted text-sm">Last updated {updated}</p>
        <div className="mt-8 space-y-6 text-text-muted">{children}</div>
      </main>
      <footer className="border-t border-border">
        <div className="max-w-layout mx-auto px-6 py-8 text-sm text-text-muted">
          GleeLounge — a party gaming platform. Not affiliated with any other console.
        </div>
      </footer>
    </div>
  )
}

function H({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-bold text-text pt-2">{children}</h2>
}

export function Privacy() {
  return (
    <LegalPage title="Privacy policy" updated="October 16, 2026">
      <p>
        GleeLounge is built to need as little about you as possible. There are no
        accounts, no email sign-ups and no advertising. This policy explains what
        happens to the little data the product does touch.
      </p>

      <H>What we collect</H>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="text-text">Room codes and display names.</span> When you
          create a room you get a random 4-letter code; when you join you pick a
          display name. These live only while the room is open. When everyone leaves,
          the room and its names are gone.
        </li>
        <li>
          <span className="text-text">A reconnect token.</span> To survive a phone
          that locks mid-game, we store an anonymous identifier in your browser's
          localStorage so you can rejoin the same round. It is not linked to your
          name, email or any account.
        </li>
      </ul>

      <H>What we do not collect</H>
      <ul className="list-disc pl-5 space-y-2">
        <li>No accounts, email addresses or passwords — there is nothing to log into.</li>
        <li>No payment details — the product is free and has no in-app purchases.</li>
        <li>No precise location, contacts, camera or microphone access.</li>
        <li>No advertising trackers or cross-site cookies.</li>
      </ul>

      <H>Processors we use</H>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="text-text">Our hosting and app platform</span> — serves the
          site and the realtime server, and keeps standard security logs (such as IP
          address and request time) for abuse prevention.
        </li>
        <li>
          <span className="text-text">Google Fonts</span> — delivers the typefaces. It
          may log your IP address as part of serving the font files.
        </li>
        <li>
          <span className="text-text">Privacy-friendly analytics</span> — if enabled, a
          cookieless, page-view-only tool (for example Plausible or Umami) counts
          visits and game-starts. It does not set cookies and does not track you across
          sites.
        </li>
        <li>
          <span className="text-text">Error tracking</span> — if enabled, a tool (for
          example Sentry) records JavaScript errors and performance problems so we can
          fix crashes. Error reports are scrubbed of room codes and names.
        </li>
      </ul>
      <p>
        Payments are not live. If optional support tiers are ever added, a payment
        processor such as Stripe will be used and this policy will be updated before
        then.
      </p>

      <H>Your choices and rights</H>
      <p>
        Because we hold no account and no personal identifiers, there is no personal
        data tied to you that we can look up and delete. You can remove the reconnect
        token yourself at any time by clearing your browser's site data for this
        domain. Under GDPR and similar laws you may request access to, correction of,
        or deletion of any data we hold about you — contact us and we will help.
      </p>

      <H>Children</H>
      <p>
        GleeLounge has no account system and is suitable for family game nights. We do
        not knowingly collect data from anyone. Parents should supervise younger
        children's screen use as they would for any game.
      </p>

      <H>Changes</H>
      <p>
        If this policy changes in a meaningful way, we will update the date above and,
        where possible, announce it in the app.
      </p>

      <H>Contact</H>
      <p>Questions about privacy: hello@gleelounge.com.</p>
    </LegalPage>
  )
}

export function Terms() {
  return (
    <LegalPage title="Terms of service" updated="October 16, 2026">
      <p>
        These terms are a template and are not legal advice. Have a lawyer review them
        before you launch.
      </p>

      <H>1. The service</H>
      <p>
        GleeLounge is a browser-based party game platform: one screen acts as the
        console and other devices join as controllers using a room code. The service is
        provided free of charge.
      </p>

      <H>2. Acceptable use</H>
      <p>
        You agree not to use GleeLounge to harass, bully or threaten anyone, to share
        unlawful, obscene or infringing content, or to attempt to disrupt the service,
        including by overloading the servers or abusing room codes.
      </p>

      <H>3. Your content</H>
      <p>
        Display names, drawings and answers you create in a room belong to you. They are
        ephemeral and are deleted when the room closes. You grant us only the limited
        rights needed to run the game for the people in that room.
      </p>

      <H>4. No account and no warranty</H>
      <p>
        There is no account and no guarantee of persistence. The service is provided
        "as is", without warranties of any kind, and we are not liable for interruptions,
        lost rounds or anything else arising from its use, to the fullest extent the law
        allows.
      </p>

      <H>5. Our rights</H>
      <p>
        GleeLounge, its code, games and branding are ours. You may not resell or
        rebrand the service. We may change, pause or discontinue features at any time.
      </p>

      <H>6. Changes to these terms</H>
      <p>
        We may update these terms; the date above will change when we do. Continuing to
        use the service after a change means you accept the new terms.
      </p>

      <H>7. Contact</H>
      <p>Questions about these terms: hello@gleelounge.com.</p>
    </LegalPage>
  )
}
