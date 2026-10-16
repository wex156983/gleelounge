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
import { SequencePad } from '../../controllers/SequencePad'

const PAD_COLORS = ['var(--player-1)', 'var(--player-2)', 'var(--player-3)', 'var(--player-4)']

interface Patch {
  phase: 'watching' | 'input' | 'round_over' | 'done'
  sequence: number[]
  inputLen: number
}

export const SimonEcho = {
  Screen({ players, seed }: GameScreenProps) {
    const { sendState, endGame } = useGame()
    const rng = useRef(mulberry32(seed)).current
    const [sequence, setSequence] = useState<number[]>([])
    const [phase, setPhase] = useState<'intro' | 'watching' | 'input' | 'round_over' | 'done'>('intro')
    const [flash, setFlash] = useState<number | null>(null)
    const [alive, setAlive] = useState<Set<string>>(new Set(players.map((p) => p.id)))
    const [eliminated, setEliminated] = useState<string[]>([])
    const seqRef = useRef(sequence)
    seqRef.current = sequence
    const aliveRef = useRef(alive)
    aliveRef.current = alive
    const phaseRef = useRef(phase)
    phaseRef.current = phase
    const roundRef = useRef(0)

    useInputHandler((e) => {
      if (e.type !== 'seq' || phaseRef.current !== 'input') return
      const seq = e.payload as number[]
      const target = seqRef.current
      const correct =
        seq.length === target.length && seq.every((v, i) => v === target[i])
      if (correct) {
        // survivor scores
      } else if (aliveRef.current.has(e.playerId)) {
        const next = new Set(aliveRef.current)
        next.delete(e.playerId)
        setAlive(next)
        setEliminated((el) => [...el, e.playerId])
      }
    })

    // round loop
    useEffect(() => {
      if (phase !== 'intro') return
      roundRef.current += 1
      const nextSeq = [...seqRef.current]
      // add 2 new steps each round after the first
      const add = roundRef.current === 1 ? 3 : 2
      for (let i = 0; i < add; i++) nextSeq.push(randInt(rng, 0, 3))
      setSequence(nextSeq)
      setPhase('watching')
      sendState({ phase: 'watching', sequence: nextSeq, inputLen: nextSeq.length } satisfies Patch)
    }, [phase, rng, sendState])

    // playback
    useEffect(() => {
      if (phase !== 'watching') return
      const timers: number[] = []
      let i = 0
      const play = () => {
        if (i >= sequence.length) {
          timers.push(
            window.setTimeout(() => {
              setPhase('input')
              sendState({ phase: 'input', sequence, inputLen: sequence.length } satisfies Patch)
            }, 400),
          )
          return
        }
        const pad = sequence[i]
        setFlash(pad)
        timers.push(
          window.setTimeout(() => {
            setFlash(null)
            i++
            timers.push(window.setTimeout(play, 200))
          }, 380),
        )
      }
      timers.push(window.setTimeout(play, 800))
      return () => timers.forEach(clearTimeout)
    }, [phase, sequence, sendState])

    // after input window, advance
    useEffect(() => {
      if (phase !== 'input') return
      const t = setTimeout(() => {
        if (aliveRef.current.size <= 1) {
          setPhase('done')
          const scores: Record<string, number> = {}
          for (const p of players) scores[p.id] = aliveRef.current.has(p.id) ? 100 + seqRef.current.length : 0
          endGame(toResults('simon-echo', players, scores))
        } else {
          setPhase('intro')
          sendState({ phase: 'round_over', sequence: [], inputLen: 0 } satisfies Patch)
        }
      }, 500 + sequence.length * 700)
      return () => clearTimeout(t)
    }, [phase, sequence.length, players, endGame, sendState])

    const nameOf = Object.fromEntries(players.map((p) => [p.id, p.name]))

    return (
      <div className="h-full flex flex-col items-center justify-center gap-8 p-8">
        <div className="text-display font-bold">Simon Echo — length {sequence.length}</div>
        {phase === 'watching' && <div className="text-display-lg text-text-muted">Watch closely…</div>}
        {phase === 'input' && <div className="text-display-lg text-accent">Now repeat it on your phone!</div>}
        {phase === 'intro' && <div className="text-display-lg animate-pop">Get ready…</div>}
        <div className="grid grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-40 h-40 rounded-lg transition-all duration-100"
              style={{
                background: PAD_COLORS[i],
                opacity: flash === i ? 1 : 0.35,
                transform: flash === i ? 'scale(1.08)' : 'scale(1)',
                boxShadow: flash === i ? '0 0 40px rgba(255,255,255,0.5)' : 'none',
              }}
            />
          ))}
        </div>
        <div className="flex gap-4">
          {players.map((p) => (
            <div key={p.id} className={`dark text-sm font-bold ${alive.has(p.id) ? '' : 'opacity-40 line-through'}`}>
              {p.avatarId} {nameOf[p.id]}
            </div>
          ))}
        </div>
        {eliminated.length > 0 && (
          <div className="text-text-muted text-sm">
            Out: {eliminated.map((id) => nameOf[id]).join(', ')}
          </div>
        )}
      </div>
    )
  },

  Controller({ self }: GameCtrlProps) {
    const { sendInput } = useGame()
    const patch = useTypedPatch<Patch>()
    const [done, setDone] = useState(false)
    const watching = patch?.phase === 'watching'

    useEffect(() => {
      if (patch?.phase === 'watching') setDone(false)
    }, [patch?.phase, patch?.inputLen])

    if (patch?.phase === 'done' || (done && patch?.phase !== 'input')) {
      return (
        <div className="flex items-center justify-center h-full text-text-muted p-6 safe-pb">
          Round over — look at the big screen!
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center gap-8 h-full p-6 safe-pb">
        <p className="text-text-muted font-semibold text-center">
          {watching ? 'Watch the big screen…' : 'Repeat the sequence!'}
        </p>
        <SequencePad
          expectLen={patch?.inputLen ?? 0}
          locked={watching}
          onSeq={(seq) => {
            setDone(true)
            sendInput('seq', seq)
          }}
        />
        {self && <p className="text-sm text-text-muted">{self.name}</p>}
      </div>
    )
  },
}
