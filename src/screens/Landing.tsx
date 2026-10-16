import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { GameCard } from '../components/ui/GameCard'
import { REGISTRY } from '../games/registry'

const STEPS = [
  { n: '1', title: 'Open on the big screen', desc: 'Your TV, laptop or tablet in the browser — this is the console.' },
  { n: '2', title: 'Join from your phone', desc: 'Type the 4-letter code — your phone becomes the controller.' },
  { n: '3', title: 'Pick a game and go', desc: 'Every game unlocked, no ads, no sign-up. Switch anytime.' },
]

const PROBLEM = [
  {
    title: 'The fun is behind a paywall',
    desc: 'Two players free, the rest locked, an ad break every round. The best games need a monthly subscription just to join.',
  },
  {
    title: 'Cancelling is a maze',
    desc: 'People cancel and still get charged. Getting a refund turns into a fight. It should never be this hard to stop paying.',
  },
]

const FEATURES = [
  {
    emoji: '🎉',
    title: 'Every game free, every player',
    desc: 'All 7 games, up to 8 players, zero ads. No "unlock the rest" screen, ever.',
  },
  {
    emoji: '📱',
    title: 'Lock your phone, stay in the game',
    desc: 'Screen locks, a call comes in, you wander off — come back and you\u2019re still in the round. The party never gets kicked.',
  },
  {
    emoji: '📺',
    title: 'Any screen is the console',
    desc: 'A TV browser, a laptop on the coffee table, an iPad — anything that opens a website is the big screen.',
  },
  {
    emoji: '🚪',
    title: 'No account, no install',
    desc: 'Open a link and play. We never ask for an email, a card, or a download from an app store.',
  },
  {
    emoji: '🎮',
    title: 'Play solo, or grab a keyboard',
    desc: 'Some games play solo, and the big screen takes a keyboard when a phone isn\u2019t handy.',
  },
  {
    emoji: '🔳',
    title: 'Scan or type — your call',
    desc: 'A QR code up top and a big 4-letter code below it. Join the way you prefer.',
  },
]

const PRICING = [
  {
    name: 'Free',
    who: 'Everyone',
    price: '$0',
    per: 'forever',
    points: ['All 7 games', 'Up to 8 players', 'No ads, no account', 'No install, no card'],
    highlight: true,
    cta: 'Start a game',
  },
  {
    name: 'Patron',
    who: 'Keeps it free for everyone',
    price: '$14',
    per: 'per year',
    points: ['Supporter badge', 'Your name in the credits', 'Early access to new games', 'Unlocks nothing — it\u2019s all already free'],
    highlight: false,
    cta: 'Become a Patron',
  },
  {
    name: 'Host Kit',
    who: 'Teachers, offices, cafés',
    price: '$29',
    per: 'one time',
    points: ['Custom room code', 'Saved game playlists', 'Printable QR poster', 'One payment, no renewal'],
    highlight: false,
    cta: 'Get the Host Kit',
  },
]

const FAQ = [
  {
    q: 'Is it really free?',
    a: 'Yes. Every game, every player, no ads. No card, no account, no catch.',
  },
  {
    q: 'What do I need?',
    a: 'Anything with a browser — a TV, a laptop or an iPad for the big screen, and a phone for each player.',
  },
  {
    q: 'How many people can play?',
    a: 'Up to 8, depending on the game. The lobby shows the live count as friends join.',
  },
  {
    q: 'Do I have to install anything?',
    a: 'No. The screen opens a website; phones scan a QR code. That\u2019s the whole setup.',
  },
  {
    q: 'Can I play alone?',
    a: 'Some games yes — Word Sprint, Quiz Party and Karts all play solo.',
  },
  {
    q: 'What if someone\u2019s phone dies mid-game?',
    a: 'Reopen the link, type your name, and you\u2019re back in the same round with your score intact.',
  },
  {
    q: 'Does it work over a video call?',
    a: 'Yes — share the screen and everyone joins from their own phone, from anywhere.',
  },
]

export function Landing() {
  return (
    <div className="min-h-full">
      <header className="max-w-layout mx-auto flex items-center justify-between px-6 py-5">
        <span className="text-xl font-bold">
          🎮 <span className="text-accent">Glee</span>Lounge
        </span>
        <Link to="/console">
          <Button size="md">Start playing</Button>
        </Link>
      </header>

      <main>
        <section className="max-w-layout mx-auto px-6 pt-12 pb-20 text-center">
          <h1 className="text-display-lg font-bold leading-tight">
            Every game. Every player. <span className="text-accent">Free</span>.
          </h1>
          <p className="mt-6 text-xl text-text-muted max-w-2xl mx-auto">
            Your TV is the screen, your phones are the controllers. No ads, no
            paywall, no account — a 4-letter code and everyone’s playing.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/console">
              <Button size="tv" variant="cta">
                Start a game right here
              </Button>
            </Link>
            <Link to="/join">
              <Button size="tv" variant="secondary">
                Join from your phone
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-layout mx-auto px-6 pb-20">
          <div className="rounded-xl border border-border bg-surface p-8 md:p-12">
            <h2 className="text-xl font-bold text-center">
              Most party apps put the fun behind a paywall.
            </h2>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {PROBLEM.map((p) => (
                <div key={p.title}>
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <p className="mt-2 text-text-muted">{p.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-lg">
              GleeLounge is the opposite. <span className="font-bold">Everything free, for everyone, no strings.</span>
            </p>
          </div>
        </section>

        <section className="max-w-layout mx-auto px-6 pb-20">
          <h2 className="text-xl font-bold text-center mb-8">How game night starts</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-surface rounded-lg p-6 border border-border">
                <div className="w-10 h-10 rounded-pill bg-accent text-on-accent flex items-center justify-center font-bold text-lg">
                  {s.n}
                </div>
                <h3 className="mt-4 font-bold text-lg">{s.title}</h3>
                <p className="mt-2 text-text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-layout mx-auto px-6 pb-20">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold">Built for the room you’re actually in</h2>
            <p className="mt-2 text-text-muted">Room codes, a live player list and a scoreboard come standard. These are the parts we care about most.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface rounded-lg p-6 border border-border">
                <div className="text-2xl" aria-hidden>{f.emoji}</div>
                <h3 className="mt-3 font-bold text-lg">{f.title}</h3>
                <p className="mt-2 text-text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-layout mx-auto px-6 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Every game free, no ads</h2>
            <span className="text-text-muted text-sm">{REGISTRY.length} original games</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {REGISTRY.map((g) => (
              <GameCard key={g.meta.id} game={g.meta} />
            ))}
          </div>
        </section>

        <section id="pricing" className="max-w-layout mx-auto px-6 pb-24">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold">Free is the product</h2>
            <p className="mt-2 text-text-muted">The paid tiers change nothing about access. No game is ever locked.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PRICING.map((t) => (
              <div
                key={t.name}
                className={`rounded-xl p-6 border ${t.highlight ? 'border-accent bg-surface shadow-glow' : 'border-border bg-surface'}`}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-lg">{t.name}</h3>
                  {t.highlight && <span className="text-xs font-semibold text-on-accent bg-accent px-2 py-1 rounded-pill uppercase tracking-wide">Start here</span>}
                </div>
                <p className="mt-1 text-sm text-text-muted">{t.who}</p>
                <p className="mt-4">
                  <span className="text-display font-bold">{t.price}</span>
                  <span className="ml-2 text-text-muted">{t.per}</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {t.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-accent" aria-hidden>✓</span>
                      <span className="text-text-muted">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link to="/console">
                    <Button variant={t.highlight ? 'cta' : 'secondary'} className="w-full">
                      {t.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-layout mx-auto px-6 pb-24">
          <h2 className="text-xl font-bold text-center mb-8">Questions people ask</h2>
          <div className="max-w-3xl mx-auto divide-y divide-border border border-border rounded-lg overflow-hidden">
            {FAQ.map((item) => (
              <details key={item.q} className="group bg-surface">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 font-semibold">
                  {item.q}
                  <span className="text-accent transition-transform duration-fast group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="px-5 pb-4 text-text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="max-w-layout mx-auto px-6 pb-24 text-center">
          <h2 className="text-display-lg font-bold leading-tight">
            Your friends are already holding the <span className="text-accent">controllers</span>.
          </h2>
          <div className="mt-8">
            <Link to="/console">
              <Button size="tv" variant="cta">
                Start a room
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-layout mx-auto px-6 py-8 text-sm text-text-muted flex justify-between flex-wrap gap-4">
          <span>GleeLounge — a party gaming platform. Not affiliated with any other console.</span>
          <nav className="flex gap-5" aria-label="Legal">
            <Link to="/privacy" className="hover:text-text">Privacy</Link>
            <Link to="/terms" className="hover:text-text">Terms</Link>
          </nav>
          <span>Built for friends in the same room.</span>
        </div>
      </footer>
    </div>
  )
}
