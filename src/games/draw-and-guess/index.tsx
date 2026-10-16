import { useEffect, useMemo, useRef, useState } from 'react'
import {
  useGame,
  useInputHandler,
  useTypedPatch,
  mulberry32,
  pickOne,
  toResults,
  type GameCtrlProps,
  type GameScreenProps,
} from '../runtime'
import { DrawPad, type Stroke } from '../../controllers/DrawPad'
import { TextPad } from '../../controllers/TextPad'

const PHRASES = [
  'happy birthday',
  'pizza party',
  'space rocket',
  'dancing robot',
  'snow mountain',
  'beach sunset',
  'magic dragon',
  'coffee mug',
  'skateboard trick',
  'moon landing',
  'birthday cake',
  'super hero',
  'wild jungle',
  'racing car',
  'ocean wave',
  'city lights',
]

const ROUNDS = 3
const DRAW_SECONDS = 45

interface Patch {
  phase: 'show_drawer' | 'drawing' | 'reveal' | 'between'
  drawerId: string | null
  phrase: string | null
  strokes: Stroke[] | null
  secondsLeft: number
  guesses: { name: string; text: string; correct: boolean }[]
  revealed: boolean
}

export const DrawAndGuess = {
  Screen({ players, seed }: GameScreenProps) {
    const { sendState, endGame } = useGame()
    const rng = useRef(mulberry32(seed)).current
    const [round, setRound] = useState(1)
    const [phase, setPhase] = useState<'show_drawer' | 'drawing' | 'reveal' | 'between' | 'done'>('show_drawer')
    const [drawerIdx, setDrawerIdx] = useState(0)
    const [phrase, setPhrase] = useState('')
    const [strokes, setStrokes] = useState<Stroke[]>([])
    const [secondsLeft, setSecondsLeft] = useState(DRAW_SECONDS)
    const [guesses, setGuesses] = useState<{ playerId: string; text: string; correct: boolean }[]>([])
    const [scores, setScores] = useState<Record<string, number>>(
      Object.fromEntries(players.map((p) => [p.id, 0])),
    )
    const phaseRef = useRef(phase)
    phaseRef.current = phase
    const strokesRef = useRef(strokes)
    strokesRef.current = strokes
    const guessesRef = useRef(guesses)
    guessesRef.current = guesses
    const scoresRef = useRef(scores)
    scoresRef.current = scores
    const drawer = players[drawerIdx % players.length]
    const nameOf = useMemo(
      () => Object.fromEntries(players.map((p) => [p.id, p.name])),
      [players],
    )
    const usedPhrases = useRef<string[]>([])

    useInputHandler((e) => {
      if (e.type === 'strokes' && phaseRef.current === 'drawing') {
        setStrokes(e.payload as Stroke[])
      } else if (e.type === 'guess' && phaseRef.current === 'drawing') {
        const text = String(e.payload ?? '').toLowerCase().trim()
        if (e.playerId === drawer?.id) return
        const correct = text === phrase
        setGuesses((g) => [...g, { playerId: e.playerId, text, correct }])
        if (correct) {
          setScores((s) => ({ ...s, [e.playerId]: (s[e.playerId] ?? 0) + 2, [drawer.id]: (s[drawer.id] ?? 0) + 1 }))
          setPhase('reveal')
        }
        void nameOf
      }
    })

    useEffect(() => {
      if (phase !== 'show_drawer') return
      let p = pickOne(rng, PHRASES)
      while (usedPhrases.current.includes(p) && usedPhrases.current.length < PHRASES.length) {
        p = pickOne(rng, PHRASES)
      }
      usedPhrases.current.push(p)
      setPhrase(p)
      setStrokes([])
      setGuesses([])
      setSecondsLeft(DRAW_SECONDS)
      const t = setTimeout(() => {
        setPhase('drawing')
      sendState({
        phase: 'drawing',
        drawerId: drawer?.id ?? null,
        phrase,
        strokes: [],
        secondsLeft: DRAW_SECONDS,
        guesses: [],
        revealed: false,
      } satisfies Patch)
      }, 4000)
      return () => clearTimeout(t)
    }, [phase, round, rng, sendState, drawer])

    // broadcast strokes + timer
    useEffect(() => {
      if (phase !== 'drawing') return
      const iv = setInterval(() => {
        setSecondsLeft((s) => {
          const next = s - 1
          sendState({
            phase: 'drawing',
            drawerId: drawer?.id ?? null,
            phrase: null,
            strokes: strokesRef.current,
            secondsLeft: next,
            guesses: guessesRef.current
              .slice(-8)
              .map((g) => ({ name: nameOf[g.playerId] ?? '?', text: g.text, correct: g.correct })),
            revealed: false,
          } satisfies Patch)
          if (next <= 0) {
            clearInterval(iv)
            setPhase('reveal')
          }
          return Math.max(0, next)
        })
      }, 1000)
      return () => clearInterval(iv)
    }, [phase, drawer, nameOf, sendState])

    useEffect(() => {
      if (phase !== 'reveal') return
      sendState({
        phase: 'reveal',
        drawerId: drawer?.id ?? null,
        phrase,
        strokes: strokesRef.current,
        secondsLeft: 0,
        guesses: guessesRef.current
          .slice(-8)
          .map((g) => ({ name: nameOf[g.playerId] ?? '?', text: g.text, correct: g.correct })),
        revealed: true,
      } satisfies Patch)
      const t = setTimeout(() => {
        if (round >= ROUNDS) {
          setPhase('done')
          endGame(toResults('draw-and-guess', players, scoresRef.current))
        } else {
          setRound((r) => r + 1)
          setDrawerIdx((i) => i + 1)
          setPhase('show_drawer')
        }
      }, 4000)
      return () => clearTimeout(t)
    }, [phase, round, drawer, phrase, players, endGame, nameOf, sendState])

    // stroke broadcast during drawing (throttled by drawer send rate)
    useEffect(() => {
      if (phase !== 'drawing') return
      sendState({
        phase: 'drawing',
        drawerId: drawer?.id ?? null,
        phrase: null,
        strokes,
        secondsLeft,
        guesses: guessesRef.current
          .slice(-8)
          .map((g) => ({ name: nameOf[g.playerId] ?? '?', text: g.text, correct: g.correct })),
        revealed: false,
      } satisfies Patch)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [strokes])

    return (
      <div className="h-full flex flex-col gap-4 p-8">
        <div className="flex items-center justify-between">
          <div className="text-display font-bold">
            Draw &amp; Guess — round {round}/{ROUNDS}
          </div>
          {phase === 'drawing' && (
            <div className={`font-mono text-display-lg ${secondsLeft <= 10 ? 'text-danger' : ''}`}>
              {secondsLeft}s
            </div>
          )}
        </div>
        {phase === 'show_drawer' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-7xl">{drawer?.avatarId}</div>
            <div className="text-display-lg font-bold">{drawer?.name} is drawing!</div>
            <p className="text-text-muted">Everyone else: watch the screen and type your guesses</p>
          </div>
        )}
        {(phase === 'drawing' || phase === 'reveal') && (
          <div className="flex-1 grid grid-cols-[2fr_1fr] gap-6 min-h-0">
            <div className="bg-white rounded-lg overflow-hidden relative">
              <StrokesCanvas strokes={strokes} />
              {phase === 'reveal' && (
                <div className="absolute inset-x-0 bottom-0 bg-bg/90 text-center py-3 text-display font-bold">
                  It was: <span className="text-accent">{phrase}</span>
                </div>
              )}
            </div>
            <div className="space-y-1 overflow-auto">
              {guesses
                .slice()
                .reverse()
                .map((g, i) => (
                  <div
                    key={i}
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      g.correct ? 'bg-success text-on-success font-bold' : 'bg-surface'
                    }`}
                  >
                    <span className="font-semibold">{nameOf[g.playerId]}:</span> {g.correct ? '✓' : g.text}
                  </div>
                ))}
            </div>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          {players.map((p) => (
            <div key={p.id} className="text-center">
              <div className="text-2xl">{p.avatarId}</div>
              <div className="font-mono font-bold">{scores[p.id] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>
    )
  },

  Controller({ self }: GameCtrlProps) {
    const { sendInput } = useGame()
    const patch = useTypedPatch<Patch>()
    const isDrawer = self && patch?.drawerId === self.id

    if (patch?.phase === 'show_drawer') {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-6 safe-pb">
          <div className="text-6xl">{self?.avatarId}</div>
          {isDrawer ? (
            <>
              <p className="text-success font-bold text-xl">You're drawing this round!</p>
              <p className="text-text-muted">Get ready…</p>
            </>
          ) : (
            <p className="text-text-muted text-lg text-center">
              {patch.drawerId ? 'Someone else is drawing — guess on the big screen!' : 'Waiting…'}
            </p>
          )}
        </div>
      )
    }

    if (patch?.phase === 'drawing' && isDrawer) {
      return (
        <div className="flex flex-col gap-4 h-full p-4 safe-pb overflow-auto">
          <div className="text-center">
            <span className="text-sm text-text-muted">Draw this:</span>
            <div className="text-display font-bold text-accent">{patch.phrase ?? '…'}</div>
          </div>
          <DrawPad onSend={(strokes) => sendInput('strokes', strokes)} />
        </div>
      )
    }

    if (patch?.phase === 'drawing' && !isDrawer) {
      return (
        <div className="flex flex-col justify-end gap-4 h-full p-4 safe-pb">
          <p className="text-center text-text-muted">Type your guess!</p>
          <TextPad
            onSubmit={(w) => sendInput('guess', w)}
            placeholder="What is it?"
            ctaLabel="Guess"
            maxLen={30}
          />
          {patch.guesses
            ?.slice(-3)
            .map((g, i) => (
              <p key={i} className={`text-center text-sm ${g.correct ? 'text-success' : 'text-text-muted'}`}>
                {g.correct ? `Someone got it: ${g.text}` : 'Keep guessing…'}
              </p>
            ))}
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-full text-text-muted p-6 safe-pb">
        Round over — check the big screen!
      </div>
    )
  },
}

function StrokesCanvas({ strokes }: { strokes: Stroke[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const dpr = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = rect.width * dpr
    c.height = rect.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 4
    for (const s of strokes) {
      ctx.strokeStyle = s.color
      ctx.beginPath()
      for (let i = 0; i < s.points.length; i += 2) {
        const x = s.points[i] * rect.width
        const y = s.points[i + 1] * rect.height
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }, [strokes])
  return <canvas ref={ref} className="w-full h-full" />
}
