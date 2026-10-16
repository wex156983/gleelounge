import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AVATARS } from '../../shared/protocol'
import { onMsg, sendMsg, saveIdentity, loadIdentity, getSocket } from '../lib/socket'
import { useRoomState } from '../lib/net'
import { Button } from '../components/ui/Button'
import { CodeInput } from '../components/ui/CodeInput'
import { NameInput } from '../components/ui/NameInput'
import { AvatarChip } from '../components/ui/AvatarChip'
import { EmojiBar } from '../components/ui/EmojiBar'
import { DisconnectBanner } from '../components/ui/DisconnectBanner'
import { GameProvider } from '../games/runtime'
import { getGame } from '../games/registry'
import type { PublicPlayer } from '../../shared/protocol'

function randomName(): string {
  const adj = ['Swift', 'Lucky', 'Cosmic', 'Silky', 'Wild', 'Zesty', 'Merry', 'Prime']
  const noun = ['Falcon', 'Panda', 'Comet', 'Otter', 'Tiger', 'Wizard', 'Ranger', 'Pixel']
  return `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}`
}

function randomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]
}

type Phase = 'form' | 'joining' | 'lobby' | 'playing'

export function Join() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const room = useRoomState()
  const [phase, setPhase] = useState<Phase>('form')
  const [code, setCode] = useState(params.get('room') ?? '')
  const [name, setName] = useState(randomName())
  const [avatarId, setAvatarId] = useState(randomAvatar())
  const [error, setError] = useState<string | null>(null)
  const [invalidCode, setInvalidCode] = useState(false)
  const [selfId, setSelfId] = useState<string | null>(loadIdentity()?.role === 'phone' ? loadIdentity()?.playerId ?? null : null)
  const [ready, setReady] = useState(false)
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)
  const [startPlayers, setStartPlayers] = useState<PublicPlayer[]>([])
  const [seed, setSeed] = useState(0)
  const submittedRef = useRef(false)

  useEffect(() => {
    return onMsg((m) => {
      if (m.t === 'room:created' && m.room) {
        saveIdentity({ code: m.code, playerId: m.playerId, role: 'phone' })
        setSelfId(m.playerId)
        setPhase('lobby')
        submittedRef.current = false
      } else if (m.t === 'room:error') {
        setError(m.reason)
        setPhase('form')
        setInvalidCode(true)
        submittedRef.current = false
      } else if (m.t === 'room:state') {
        setCurrentGameId(m.room.currentGameId)
        if (m.room.status === 'lobby' && phase === 'playing') setPhase('lobby')
      } else if (m.t === 'game:started') {
        setStartPlayers(m.players)
        setSeed(m.seed)
        setPhase('playing')
        setReady(false)
      } else if (m.t === 'game:ended') {
        setPhase('lobby')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // socket reconnect: rejoin with stored identity
  useEffect(() => {
    const s = getSocket()
    function onConnect() {
      const id = loadIdentity()
      if (id?.role === 'phone' && id.code && id.playerId && submittedRef.current) {
        sendMsg({
          t: 'room:join',
          code: id.code,
          name,
          avatarId,
          playerId: id.playerId,
        })
      }
    }
    s.on('connect', onConnect)
    return () => {
      s.off('connect', onConnect)
    }
  }, [name, avatarId])

  const submit = useCallback(() => {
    if (!code || code.length !== 4) {
      setInvalidCode(true)
      return
    }
    setError(null)
    setInvalidCode(false)
    submittedRef.current = true
    setPhase('joining')
    const stored = loadIdentity()
    sendMsg({
      t: 'room:join',
      code: code.toUpperCase(),
      name,
      avatarId,
      playerId: stored?.role === 'phone' ? stored.playerId : undefined,
    })
  }, [code, name, avatarId])

  const self: PublicPlayer | null = useMemo(
    () => room?.players.find((p) => p.id === selfId) ?? null,
    [room, selfId],
  )

  if (phase === 'playing' && currentGameId) {
    const game = getGame(currentGameId)
    if (game) {
      return (
        <GameProvider>
          <div className="h-[100dvh] bg-bg flex flex-col">
            <div className="flex-1 min-h-0">
              <ControllerGate self={self} gameId={currentGameId} startPlayers={startPlayers} seed={seed} />
            </div>
          </div>
        </GameProvider>
      )
    }
  }

  if (phase === 'lobby' || (phase === 'playing' && !currentGameId)) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <DisconnectBanner />
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6 safe-pb">
          <h1 className="text-lg font-bold">
            🎮 <span className="text-accent">Glee</span>Lounge — room <span className="font-mono">{room?.code ?? code}</span>
          </h1>
          {self && (
            <div className="animate-pop">
              <AvatarChip player={{ ...self, ready }} size="lg" />
            </div>
          )}
          <p className="text-text-muted text-center">
            {ready ? "You're in! Waiting for the host…" : 'Tap ready when you are in!'}
          </p>
          <Button
            size="lg"
            variant={ready ? 'secondary' : 'cta'}
            className="w-full max-w-xs min-h-phone-tap"
            onClick={() => {
              const next = !ready
              setReady(next)
              sendMsg({ t: 'player:ready', ready: next })
            }}
          >
            {ready ? 'Not ready' : "I'm ready!"}
          </Button>
          {room && room.players.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {room.players.map((p) => (
                <AvatarChip key={p.id} player={p} size="sm" />
              ))}
            </div>
          )}
          <EmojiBar />
          <Button variant="ghost" size="sm" onClick={() => { sendMsg({ t: 'room:leave' }); nav('/') }}>
            Leave room
          </Button>
        </div>
      </div>
    )
  }

  // form / joining
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 p-6 safe-pb safe-pt">
      <DisconnectBanner />
      <h1 className="text-2xl font-bold">
        🎮 <span className="text-accent">Glee</span>Lounge
      </h1>
      <p className="text-text-muted">Type the code on the big screen</p>
      <CodeInput
        initial={params.get('room') ?? ''}
        onComplete={(c) => setCode(c)}
        invalid={invalidCode}
        disabled={phase === 'joining'}
        autoFocus
      />
      <NameInput value={name} onChange={setName} disabled={phase === 'joining'} />
      <div>
        <p className="text-sm text-text-muted mb-2 text-center">Pick your avatar</p>
        <div className="grid grid-cols-8 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatarId(a)}
              aria-label={`Avatar ${a}`}
              aria-pressed={avatarId === a}
              className={`w-10 h-10 rounded-pill text-xl flex items-center justify-center border-2 transition-all duration-fast ease-out ${
                avatarId === a ? 'border-accent scale-110 bg-surface' : 'border-transparent bg-surface'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <Button
        size="lg"
        variant="cta"
        className="w-full max-w-sm min-h-phone-tap"
        disabled={phase === 'joining' || code.length !== 4}
        loading={phase === 'joining'}
        onClick={submit}
      >
        Join the party
      </Button>
      {error && (
        <p className="text-danger text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function ControllerGate({
  self,
  gameId,
  startPlayers,
  seed,
}: {
  self: PublicPlayer | null
  gameId: string
  startPlayers: PublicPlayer[]
  seed: number
}) {
  const game = getGame(gameId)
  if (!game) return <div className="p-6 text-text-muted">Unknown game</div>
  void startPlayers
  void seed
  const Controller = game.Controller
  return <Controller self={self} />
}
