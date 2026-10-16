import { useEffect, useMemo, useRef, useState } from 'react'
import {
  useGame,
  useInputHandler,
  useTypedPatch,
  mulberry32,
  pickOne,
  randInt,
  toResults,
  type GameCtrlProps,
  type GameScreenProps,
} from '../runtime'
import { TextPad } from '../../controllers/TextPad'

const ROUND_SECONDS = 60
const ROUNDS = 3

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const CRITERIA = [
  'starts with the letter',
  'contains the letter',
  'ends with the letter',
] as const

interface RoundConfig {
  letter: string
  mode: (typeof CRITERIA)[number]
  minLen: number
  round: number
}

interface RoundPatch {
  phase: 'config' | 'playing' | 'reveal'
  config: RoundConfig | null
  secondsLeft: number
  live: { name: string; word: string; pts: number }[]
}

function matches(word: string, cfg: RoundConfig): boolean {
  const w = word.toLowerCase()
  const L = cfg.letter.toLowerCase()
  if (w.length < cfg.minLen) return false
  if (cfg.mode === 'starts with the letter') return w.startsWith(L)
  if (cfg.mode === 'ends with the letter') return w.endsWith(L)
  return w.includes(L)
}

export const WordSprint = {
  Screen({ players, seed }: GameScreenProps) {
    const { sendState, endGame } = useGame()
    const rng = useRef(mulberry32(seed)).current
    const [round, setRound] = useState(1)
    const [config, setConfig] = useState<RoundConfig | null>(null)
    const [phase, setPhase] = useState<'intro' | 'playing' | 'reveal' | 'done'>('intro')
    const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS)
    const [words, setWords] = useState<{ playerId: string; word: string; pts: number }[]>([])
    const [scores, setScores] = useState<Record<string, number>>(
      Object.fromEntries(players.map((p) => [p.id, 0])),
    )
    const wordsRef = useRef(words)
    wordsRef.current = words
    const scoresRef = useRef(scores)
    scoresRef.current = scores
    const configRef = useRef(config)
    configRef.current = config
    const phaseRef = useRef(phase)
    phaseRef.current = phase

    const nameOf = useMemo(
      () => Object.fromEntries(players.map((p) => [p.id, p.name])),
      [players],
    )

    useInputHandler((e) => {
      if (e.type !== 'word' || phaseRef.current !== 'playing' || !configRef.current) return
      const word = String(e.payload ?? '').toLowerCase()
      const cfg = configRef.current
      if (wordsRef.current.some((w) => w.playerId === e.playerId && w.word === word)) return
      if (!matches(word, cfg)) {
        setWords((ws) => [...ws, { playerId: e.playerId, word: `${word} ✗`, pts: 0 }])
        return
      }
      const pts = word.length
      setWords((ws) => [...ws, { playerId: e.playerId, word, pts }])
      setScores((s) => ({ ...s, [e.playerId]: (s[e.playerId] ?? 0) + pts }))
      sendState({
        phase: 'playing',
        config: cfg,
        secondsLeft,
        live: wordsRef.current
          .slice(-12)
          .map((w) => ({ name: nameOf[w.playerId] ?? '?', word: w.word, pts: w.pts })),
      } satisfies RoundPatch)
    })

    // start round
    useEffect(() => {
      if (phase !== 'intro') return
      const cfg: RoundConfig = {
        letter: pickOne(rng, LETTERS.split('')),
        mode: pickOne(rng, CRITERIA),
        minLen: randInt(rng, 4, 5),
        round,
      }
      setConfig(cfg)
      setWords([])
      setSecondsLeft(ROUND_SECONDS)
      const t = setTimeout(() => {
        setPhase('playing')
        sendState({ phase: 'playing', config: cfg, secondsLeft: ROUND_SECONDS, live: [] } satisfies RoundPatch)
      }, 4000)
      return () => clearTimeout(t)
    }, [phase, round, rng, sendState])

    // timer
    useEffect(() => {
      if (phase !== 'playing') return
      const iv = setInterval(() => {
        setSecondsLeft((s) => {
          const next = s - 1
          sendState({
            phase: 'playing',
            config: configRef.current,
            secondsLeft: next,
            live: wordsRef.current.slice(-12).map((w) => ({
              name: nameOf[w.playerId] ?? '?',
              word: w.word,
              pts: w.pts,
            })),
          } satisfies RoundPatch)
          if (next <= 0) {
            clearInterval(iv)
            setPhase('reveal')
          }
          return Math.max(0, next)
        })
      }, 1000)
      return () => clearInterval(iv)
    }, [phase, nameOf, sendState])

    useEffect(() => {
      if (phase !== 'reveal') return
      const t = setTimeout(() => {
        if (round >= ROUNDS) {
          setPhase('done')
          endGame(toResults('word-sprint', players, scoresRef.current))
        } else {
          setRound((r) => r + 1)
          setPhase('intro')
        }
      }, 3000)
      return () => clearTimeout(t)
    }, [phase, round, players, endGame])

    return (
      <div className="h-full flex flex-col gap-6 p-8 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="text-display font-bold">Word Sprint — round {round}/{ROUNDS}</div>
          <div className={`font-mono text-display-lg ${secondsLeft <= 10 ? 'text-danger' : ''}`}>
            {secondsLeft}s
          </div>
        </div>
        {phase === 'intro' && config && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-xl text-text-muted">Type words that…</p>
            <div className="text-display-lg font-bold text-center">
              {config.mode} <span className="text-accent">{config.letter}</span>, {config.minLen}+ letters
            </div>
          </div>
        )}
        {(phase === 'playing' || phase === 'reveal') && (
          <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
            <div className="space-y-1 overflow-auto">
              {words
                .slice()
                .reverse()
                .slice(0, 16)
                .map((w, i) => (
                  <div key={i} className="flex justify-between bg-surface rounded-md px-3 py-1.5">
                    <span className="font-semibold">{nameOf[w.playerId]}</span>
                    <span className={w.pts ? 'text-success font-mono' : 'text-danger font-mono'}>
                      {w.word} {w.pts ? `+${w.pts}` : ''}
                    </span>
                  </div>
                ))}
            </div>
            <div className="space-y-2">
              {players.map((p) => (
                <div key={p.id} className="flex justify-between bg-surface rounded-md px-4 py-2">
                  <span className="font-bold">{p.name}</span>
                  <span className="font-mono text-xl">{scores[p.id] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  },

  Controller({ self }: GameCtrlProps) {
    const { sendInput } = useGame()
    const patch = useTypedPatch<RoundPatch>()
    const [sent, setSent] = useState<string[]>([])
    const playing = patch?.phase === 'playing'

    useEffect(() => {
      if (!playing) setSent([])
    }, [playing, patch?.config?.round])

    const cfg = patch?.config

    return (
      <div className="flex flex-col justify-center gap-6 h-full p-4 safe-pb">
        {!playing && (
          <div className="text-center text-lg text-text-muted">
            {patch?.phase === 'reveal' ? 'Round over — check the big screen!' : 'Get ready…'}
          </div>
        )}
        {playing && cfg && (
          <>
            <div className="text-center">
              <div className="text-sm text-text-muted">Words that</div>
              <div className="text-xl font-bold">
                {cfg.mode} <span className="text-accent">{cfg.letter}</span>, {cfg.minLen}+ letters
              </div>
            </div>
            <TextPad
              onSubmit={(w) => {
                sendInput('word', w)
                setSent((s) => [...s, w])
              }}
              maxLen={20}
              placeholder="Type a word…"
            />
            <div className="flex flex-wrap gap-1.5 justify-center">
              {sent.slice(-10).map((w, i) => (
                <span key={i} className="text-xs bg-surface rounded-pill px-2 py-0.5 text-text-muted">
                  {w}
                </span>
              ))}
            </div>
          </>
        )}
        {self && <p className="text-center text-sm text-text-muted">{self.name}</p>}
      </div>
    )
  },
}
