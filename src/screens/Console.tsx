import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { MatchResults, PublicPlayer } from '../../shared/protocol'
import { onMsg, sendMsg, saveIdentity, clearIdentity, getSocket } from '../lib/socket'
import { useRoomState } from '../lib/net'
import { Button } from '../components/ui/Button'
import { CodeDisplay } from '../components/ui/CodeDisplay'
import { QRCode } from '../components/ui/QRCode'
import { AvatarChip } from '../components/ui/AvatarChip'
import { GameCard } from '../components/ui/GameCard'
import { FilterChip } from '../components/ui/FilterChip'
import { ScoreTable } from '../components/ui/ScoreTable'
import { Podium } from '../components/ui/Podium'
import { DisconnectBanner } from '../components/ui/DisconnectBanner'
import { GameProvider } from '../games/runtime'
import { getGame, REGISTRY } from '../games/registry'
import type { GameMeta } from '../../shared/protocol'

const GENRES = ['All', 'party', 'quiz', 'word', 'drawing', 'racing', 'action'] as const
const BUCKETS: { label: string; test: (g: GameMeta) => boolean }[] = [
  { label: 'Any size', test: () => true },
  { label: '2–4', test: (g) => g.playersMin <= 4 },
  { label: '5+', test: (g) => g.playersMax >= 5 },
]

export function Console() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const room = useRoomState()
  const [phase, setPhase] = useState<'idle' | 'lobby' | 'playing' | 'results'>('idle')
  const [code, setCode] = useState<string | null>(params.get('room'))
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<GameMeta | null>(null)
  const [showDetail, setShowDetail] = useState<GameMeta | null>(null)
  const [genre, setGenre] = useState<string>('All')
  const [bucket, setBucket] = useState(0)
  const [startPlayers, setStartPlayers] = useState<PublicPlayer[]>([])
  const [seed, setSeed] = useState(0)
  const [results, setResults] = useState<MatchResults | null>(null)
  const codeRef = useRef(code)
  codeRef.current = code

  useEffect(() => {
    return onMsg((m) => {
      if (m.t === 'room:created' && m.code) {
        setCode(m.code)
        saveIdentity({ code: m.code, playerId: m.playerId, role: 'screen' })
        setPhase('lobby')
      } else if (m.t === 'screen:hello:ok') {
        setPhase(m.room.status === 'in_game' ? 'playing' : m.room.status === 'results' ? 'results' : 'lobby')
      } else if (m.t === 'room:error') {
        setError(m.reason)
      } else if (m.t === 'error') {
        setError(m.reason)
      } else if (m.t === 'game:started') {
        setStartPlayers(m.players)
        setSeed(m.seed)
        setPhase('playing')
        setShowDetail(null)
      } else if (m.t === 'game:ended') {
        setResults(m.results)
        setPhase('results')
      }
    })
  }, [])

  // if we arrive with ?room=CODE, claim the screen role
  useEffect(() => {
    const r = params.get('room')
    if (r) sendMsg({ t: 'screen:hello', code: r })
  }, [params])

  const createRoom = useCallback(() => {
    setError(null)
    const name = 'Host'
    const avatarId = '🦊'
    sendMsg({ t: 'room:create', name, avatarId })
  }, [])

  const startGame = useCallback((gameId: string) => {
    setError(null)
    sendMsg({ t: 'game:start', gameId })
  }, [])

  const backToLobby = useCallback(() => {
    sendMsg({ t: 'game:lobby' })
    setResults(null)
    setPhase('lobby')
  }, [])

  const leave = useCallback(() => {
    sendMsg({ t: 'room:leave' })
    clearIdentity()
    setCode(null)
    setPhase('idle')
    nav('/')
  }, [nav])

  const filtered = useMemo(() => {
    return REGISTRY.filter((g) => {
      if (genre !== 'All' && g.meta.genre !== genre) return false
      if (!BUCKETS[bucket].test(g.meta)) return false
      return true
    })
  }, [genre, bucket])

  if (phase === 'idle') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-8 p-8">
        <DisconnectBanner />
        <h1 className="text-display-lg font-bold">
          🎮 <span className="text-accent">Glee</span>Lounge
        </h1>
        <p className="text-xl text-text-muted">Open this on your TV or laptop — you're the host.</p>
        <Button size="tv" variant="cta" onClick={createRoom} disabled={!!error}>
          Start a room
        </Button>
        {error && <p className="text-danger" role="alert">{error}</p>}
        <p className="text-sm text-text-muted max-w-md text-center">
          This screen is the party. Friends join from their phones with the code.
        </p>
      </div>
    )
  }

  if (phase === 'playing' && selectedGame) {
    const GameScreen = getGame(selectedGame.id)?.Screen
    if (!GameScreen) return null
    return (
      <GameProvider>
        <div className="h-screen w-screen overflow-hidden bg-bg">
          <GameScreen
            players={startPlayers}
            seed={seed}
            onEnd={(r) => sendMsg({ t: 'game:end', results: r })}
          />
        </div>
      </GameProvider>
    )
  }

  if (phase === 'results' && results) {
    const g = getGame(results.gameId)?.meta
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-10 p-8">
        <h1 className="text-display-lg font-bold">{g?.title ?? 'Results'}</h1>
        <Podium entries={results.entries} />
        <div className="w-full max-w-md">
          <ScoreTable entries={results.entries} />
        </div>
        <div className="flex gap-4">
          <Button size="lg" variant="cta" onClick={() => startGame(results.gameId)}>
            Rematch
          </Button>
          <Button size="lg" variant="secondary" onClick={backToLobby}>
            Back to lobby
          </Button>
        </div>
      </div>
    )
  }

  // lobby / library
  const hostId = room?.hostId
  return (
    <div className="min-h-full">
      <DisconnectBanner />
      <header className="max-w-layout mx-auto flex items-center justify-between px-6 py-5">
        <h1 className="text-xl font-bold">
          🎮 <span className="text-accent">Glee</span>Lounge
        </h1>
        <div className="flex items-center gap-4">
          {code && <span className="font-mono text-2xl tracking-widest">{code}</span>}
          <Button variant="ghost" size="sm" onClick={leave}>
            Leave
          </Button>
        </div>
      </header>

      <main className="max-w-layout mx-auto px-6 pb-16 grid lg:grid-cols-[340px_1fr] gap-8">
        <aside className="space-y-6">
          {code && (
            <div className="bg-surface rounded-lg border border-border p-6 flex flex-col items-center gap-4">
              <h2 className="font-bold text-lg">Friends join with</h2>
              <CodeDisplay code={code} size="phone" />
              <QRCode url={`${window.location.origin}/join?room=${code}`} />
            </div>
          )}
          <div className="bg-surface rounded-lg border border-border p-4">
            <h2 className="font-bold mb-3">
              Players ({room?.players.length ?? 0}/{16})
            </h2>
            <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-md bg-accent text-on-accent">
              <span aria-hidden="true" className="text-lg">🖥️</span>
              <span className="text-sm font-semibold">Host — this screen</span>
              <span aria-hidden="true" className="text-sm">👑</span>
            </div>
            {room && room.players.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {room.players.map((p) => (
                  <AvatarChip key={p.id} player={p} size="sm" />
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">Waiting for friends…</p>
            )}
          </div>
          {selectedGame && (
            <div className="bg-surface rounded-lg border-2 border-accent p-4 space-y-3">
              <h2 className="font-bold">Selected</h2>
              <GameCard game={selectedGame} size="lg" selected />
              <Button
                size="lg"
                variant="cta"
                className="w-full"
                onClick={() => startGame(selectedGame.id)}
              >
                Start {selectedGame.title}
              </Button>
              <p className="text-xs text-text-muted text-center">
                Needs {selectedGame.playersMin}–{selectedGame.playersMax} players
              </p>
            </div>
          )}
          {error && (
            <p className="text-danger text-sm" role="alert">
              {error}
            </p>
          )}
        </aside>

        <section>
          <div className="flex flex-wrap gap-2 mb-4">
            {GENRES.map((g) => (
              <FilterChip key={g} label={g === 'All' ? 'All' : g} active={genre === g} onClick={() => setGenre(g)} />
            ))}
            <span className="w-px bg-border mx-1" />
            {BUCKETS.map((b, i) => (
              <FilterChip key={b.label} label={b.label} active={bucket === i} onClick={() => setBucket(i)} />
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-text-muted">
              <p className="text-lg">No games match — try clearing filters.</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setGenre('All')
                  setBucket(0)
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((g) => (
                <div key={g.meta.id} className="relative">
                  <GameCard
                    game={g.meta}
                    selected={selectedGame?.id === g.meta.id}
                    onClick={() => setShowDetail(g.meta)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showDetail && (
        <div
          className="fixed inset-0 bg-bg/80 flex items-center justify-center p-6 z-40"
          onClick={() => setShowDetail(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={showDetail.title}
            className="bg-surface rounded-lg border border-border max-w-lg w-full p-6 space-y-4 animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-32 rounded-md bg-gradient-to-br ${showDetail.coverGradient} flex items-center justify-center text-6xl`}>
              {showDetail.coverEmoji}
            </div>
            <h2 className="text-display font-bold">{showDetail.title}</h2>
            <p className="text-text-muted">{showDetail.description}</p>
            <p className="text-sm">
              {showDetail.playersMin}–{showDetail.playersMax} players · <span className="capitalize">{showDetail.genre}</span>
              {showDetail.hasSolo && ' · solo mode'}
            </p>
            <div className="flex gap-3">
              <Button size="lg" variant="cta" onClick={() => { setSelectedGame(showDetail); setShowDetail(null) }}>
                Select
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setShowDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {!code && (
        <div className="fixed inset-x-0 bottom-0 p-4 flex justify-center">
          <Button variant="cta" onClick={createRoom}>
            Start a room to play
          </Button>
        </div>
      )}
      {void hostId}
      {void getSocket}
    </div>
  )
}
