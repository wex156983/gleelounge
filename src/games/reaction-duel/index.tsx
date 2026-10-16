import { useEffect, useRef, useState } from 'react'
import {
  useGame,
  useInputHandler,
  useTypedPatch,
  mulberry32,
  randInt,
  toResults,
  type GameCtrlProps,
  type GameScreenProps,
} from '../runtime'
import { ReactionButton } from '../../controllers/ReactionButton'
import { AvatarChip } from '../../components/ui/AvatarChip'

const ROUNDS = 5

interface RoundPatch {
  phase: 'wait' | 'armed' | 'reveal'
  round: number
}

export const ReactionDuel = {
  Screen({ players, seed }: GameScreenProps) {
    const { sendState, endGame } = useGame()
    const rng = useRef(mulberry32(seed)).current
    const [phase, setPhase] = useState<'countdown' | 'wait' | 'armed' | 'reveal' | 'done'>('countdown')
    const [round, setRound] = useState(1)
    const [winnerId, setWinnerId] = useState<string | null>(null)
    const [scores, setScores] = useState<Record<string, number>>(
      Object.fromEntries(players.map((p) => [p.id, 0])),
    )
    const phaseRef = useRef(phase)
    phaseRef.current = phase
    const scoresRef = useRef(scores)
    scoresRef.current = scores

    useInputHandler((e) => {
      if (e.type !== 'tap') return
      if (phaseRef.current === 'armed') {
        setWinnerId(e.playerId)
        setScores((s) => ({ ...s, [e.playerId]: (s[e.playerId] ?? 0) + 1 }))
        setPhase('reveal')
        sendState({ phase: 'reveal', round } satisfies RoundPatch)
      }
    })

    useEffect(() => {
      if (phase !== 'countdown') return
      const t = setTimeout(() => {
        setPhase('wait')
        sendState({ phase: 'wait', round } satisfies RoundPatch)
        const delay = randInt(rng, 1500, 4000)
        const t2 = setTimeout(() => {
          if (phaseRef.current === 'wait') {
            setPhase('armed')
            sendState({ phase: 'armed', round } satisfies RoundPatch)
          }
        }, delay)
        return () => clearTimeout(t2)
      }, 2500)
      return () => clearTimeout(t)
    }, [phase, round, rng, sendState])

    useEffect(() => {
      if (phase !== 'reveal') return
      const t = setTimeout(() => {
        if (round >= ROUNDS) {
          setPhase('done')
          endGame(toResults('reaction-duel', players, scoresRef.current))
        } else {
          setRound((r) => r + 1)
          setWinnerId(null)
          setPhase('countdown')
        }
      }, 2200)
      return () => clearTimeout(t)
    }, [phase, round, players, endGame])

    return (
      <div className="h-full flex flex-col items-center justify-center gap-10 p-8">
        <div className="text-display font-bold">
          Round {round} / {ROUNDS}
        </div>
        {phase === 'countdown' && <div className="text-display-lg animate-pop text-text-muted">Get ready…</div>}
        {phase === 'wait' && <div className="text-display-lg text-text-muted">Hands off the phone…</div>}
        {phase === 'armed' && <div className="text-display-lg text-success animate-pulse">TAP NOW!</div>}
        {(phase === 'reveal' || phase === 'done') && winnerId && (
          <div className="text-display-lg animate-pop">
            🎉 {players.find((p) => p.id === winnerId)?.name} wins the round!
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-6">
          {players.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-2">
              <AvatarChip player={{ ...p, ready: false, connected: true }} size="md" />
              <span className="font-mono text-2xl font-bold">{scores[p.id] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },

  Controller({ self }: GameCtrlProps) {
    const { sendInput } = useGame()
    const patch = useTypedPatch<RoundPatch>()
    const [tapped, setTapped] = useState(false)
    const armed = patch?.phase === 'armed'

    useEffect(() => {
      if (!armed) setTapped(false)
    }, [armed, patch?.round])

    return (
      <div className="flex flex-col items-center justify-center gap-8 h-full p-6 safe-pb">
        <p className="text-text-muted font-semibold text-center">
          Wait for the screen to flash green — then tap as fast as you can!
        </p>
        <ReactionButton
          armed={armed}
          disabled={tapped}
          onTap={() => {
            if (tapped) return
            setTapped(true)
            sendInput('tap', Date.now())
          }}
        />
        {tapped && <p className="text-success font-bold">Sent! ✓</p>}
        {self && <p className="text-sm text-text-muted">Playing as {self.name}</p>}
      </div>
    )
  },
}
