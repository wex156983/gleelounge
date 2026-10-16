import { useEffect, useMemo, useRef, useState } from 'react'
import {
  useGame,
  useInputHandler,
  useTypedPatch,
  mulberry32,
  toResults,
  type GameCtrlProps,
  type GameScreenProps,
} from '../runtime'
import { TapGrid } from '../../controllers/TapGrid'

const QUESTIONS: { q: string; opts: string[]; correct: number }[] = [
  { q: 'Which planet has the most moons confirmed so far?', opts: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'], correct: 0 },
  { q: 'What is the chemical symbol for gold?', opts: ['Go', 'Gd', 'Au', 'Ag'], correct: 2 },
  { q: 'How many sides does a hexagon have?', opts: ['5', '6', '7', '8'], correct: 1 },
  { q: 'Which language has the most native speakers?', opts: ['English', 'Spanish', 'Hindi', 'Mandarin Chinese'], correct: 3 },
  { q: 'What year did the first iPhone launch?', opts: ['2005', '2006', '2007', '2008'], correct: 2 },
  { q: 'Which gas do plants absorb from the air?', opts: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correct: 2 },
  { q: 'What is the largest ocean on Earth?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3 },
  { q: 'Which instrument has 88 keys?', opts: ['Accordion', 'Piano', 'Organ', 'Harpsichord'], correct: 1 },
  { q: 'What does CPU stand for?', opts: ['Central Process Unit', 'Computer Personal Unit', 'Central Processor Utility', 'Core Program Unit'], correct: 0 },
  { q: 'Which country hosted the 2016 Summer Olympics?', opts: ['China', 'UK', 'Brazil', 'Japan'], correct: 2 },
  { q: 'How many bones are in an adult human body?', opts: ['186', '206', '226', '246'], correct: 1 },
  { q: 'What is the boiling point of water at sea level in Celsius?', opts: ['90', '95', '100', '110'], correct: 2 },
]

const ROUNDS = 5
const ANSWER_SECONDS = 20

interface Patch {
  phase: 'question' | 'reveal'
  qIdx: number
  q: string
  opts: string[]
  secondsLeft: number
  tally: number[]
  correct: number | null
}

export const QuizParty = {
  Screen({ players, seed }: GameScreenProps) {
    const { sendState, endGame } = useGame()
    const rng = useRef(mulberry32(seed)).current
    const qs = useMemo(() => {
      const pool = [...QUESTIONS]
      const out: typeof QUESTIONS = []
      for (let i = 0; i < ROUNDS && pool.length; i++) {
        out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
      }
      return out
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seed])

    const [qIdx, setQIdx] = useState(0)
    const [phase, setPhase] = useState<'intro' | 'question' | 'reveal' | 'done'>('intro')
    const [secondsLeft, setSecondsLeft] = useState(ANSWER_SECONDS)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [scores, setScores] = useState<Record<string, number>>(
      Object.fromEntries(players.map((p) => [p.id, 0])),
    )
    const phaseRef = useRef(phase)
    phaseRef.current = phase
    const answersRef = useRef(answers)
    answersRef.current = answers
    const scoresRef = useRef(scores)
    scoresRef.current = scores
    const question = qs[qIdx]

    useInputHandler((e) => {
      if (e.type !== 'answer' || phaseRef.current !== 'question') return
      if (answersRef.current[e.playerId] != null) return
      const idx = Number(e.payload)
      if (Number.isNaN(idx)) return
      setAnswers((a) => ({ ...a, [e.playerId]: idx }))
    })

    useEffect(() => {
      if (phase !== 'intro') return
      const t = setTimeout(() => {
        setPhase('question')
        setSecondsLeft(ANSWER_SECONDS)
        sendState({ phase: 'question', qIdx, q: qs[qIdx].q, opts: qs[qIdx].opts, secondsLeft: ANSWER_SECONDS, tally: [0, 0, 0, 0], correct: null } satisfies Patch)
      }, 2500)
      return () => clearTimeout(t)
    }, [phase, qIdx, qs, sendState])

    useEffect(() => {
      if (phase !== 'question') return
      const iv = setInterval(() => {
        setSecondsLeft((s) => {
          const next = s - 1
          if (next <= 0) {
            clearInterval(iv)
            finishRound()
          }
          return Math.max(0, next)
        })
      }, 1000)
      return () => clearInterval(iv)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, qIdx])

    // broadcast tally live
    useEffect(() => {
      if (phase !== 'question' || !question) return
      const tally = [0, 0, 0, 0]
      for (const idx of Object.values(answers)) tally[idx] = (tally[idx] ?? 0) + 1
      sendState({ phase: 'question', qIdx, q: question.q, opts: question.opts, secondsLeft, tally, correct: null } satisfies Patch)
    }, [answers, phase, qIdx, secondsLeft, question, sendState])

    function finishRound() {
      if (!question) return
      const tally = [0, 0, 0, 0]
      const nextScores = { ...scoresRef.current }
      for (const [pid, idx] of Object.entries(answersRef.current)) {
        tally[idx] = (tally[idx] ?? 0) + 1
        if (idx === question.correct) nextScores[pid] = (nextScores[pid] ?? 0) + 100
      }
      setScores(nextScores)
      setPhase('reveal')
      sendState({ phase: 'reveal', qIdx, q: question.q, opts: question.opts, secondsLeft: 0, tally, correct: question.correct } satisfies Patch)
    }

    // end the round early once everyone still in the game has answered
    useEffect(() => {
      if (phase !== 'question') return
      const answeredCount = Object.keys(answers).length
      if (players.length > 0 && answeredCount >= players.length) {
        const t = setTimeout(finishRound, 700)
        return () => clearTimeout(t)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answers, phase, players.length])

    useEffect(() => {
      if (phase !== 'reveal') return
      const t = setTimeout(() => {
        if (qIdx + 1 >= qs.length) {
          setPhase('done')
          endGame(toResults('quiz-party', players, scoresRef.current))
        } else {
          setQIdx((i) => i + 1)
          setAnswers({})
          setPhase('intro')
        }
      }, 4000)
      return () => clearTimeout(t)
    }, [phase, qIdx, qs.length, players, endGame])

    const tally = useMemo(() => {
      const t = [0, 0, 0, 0]
      for (const idx of Object.values(answers)) t[idx] = (t[idx] ?? 0) + 1
      return t
    }, [answers])
    const answered = Object.keys(answers).length

    return (
      <div className="h-full flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div className="text-display font-bold">Quiz Party</div>
          <div className="text-xl text-text-muted">
            Q {qIdx + 1}/{qs.length}
            {phase === 'question' && (
              <span className={`ml-4 font-mono text-display ${secondsLeft <= 5 ? 'text-danger' : ''}`}>
                {secondsLeft}s
              </span>
            )}
          </div>
        </div>
        {phase === 'intro' && <div className="flex-1 flex items-center justify-center text-display-lg animate-pop">Question {qIdx + 1}…</div>}
        {question && (phase === 'question' || phase === 'reveal') && (
          <div className="flex-1 flex flex-col gap-8 min-h-0">
            <div className="text-display-lg font-bold text-center max-w-4xl mx-auto">{question.q}</div>
            <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
              {question.opts.map((o, i) => {
                const isCorrect = phase === 'reveal' && i === question.correct
                const pct = tally.reduce((a, b) => a + b, 0) > 0 ? Math.round(((tally[i] ?? 0) / tally.reduce((a, b) => a + b, 0)) * 100) : 0
                return (
                  <div
                    key={i}
                    className={`rounded-lg p-5 border-2 relative overflow-hidden ${
                      isCorrect
                        ? 'border-success bg-success/10'
                        : phase === 'reveal'
                          ? 'border-border bg-surface'
                          : 'border-border-input bg-surface'
                    }`}
                  >
                    <div className="absolute inset-y-0 left-0 bg-accent/20" style={{ width: phase === 'reveal' ? `${pct}%` : 0 }} />
                    <div className="relative flex justify-between items-center">
                      <span className="font-bold text-xl">{o}</span>
                      {phase === 'reveal' && <span className="font-mono text-xl">{pct}%</span>}
                    </div>
                  </div>
                )
              })}
            </div>
            {phase === 'question' && (
              <div className="text-center text-text-muted">{answered}/{players.length} answered</div>
            )}
          </div>
        )}
        <div className="flex gap-4 justify-center flex-wrap">
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
    const [picked, setPicked] = useState<number | null>(null)
    const playing = patch?.phase === 'question'

    useEffect(() => {
      if (playing) setPicked(null)
    }, [playing, patch?.qIdx])

    const opts = patch?.opts ?? []

    return (
      <div className="flex flex-col justify-center gap-6 h-full p-4 safe-pb">
        {!playing && (
          <p className="text-center text-lg text-text-muted">
            {patch?.phase === 'reveal' ? 'See results on the big screen!' : 'Get ready…'}
          </p>
        )}
        {playing && opts.length > 0 && (
          <>
            <p className="text-center font-bold text-lg">{patch?.q}</p>
            <TapGrid
              options={opts}
              picked={picked}
              onPick={(i) => {
                setPicked(i)
                sendInput('answer', i)
              }}
            />
          </>
        )}
        {self && <p className="text-center text-sm text-text-muted">{self.name}</p>}
      </div>
    )
  },
}
