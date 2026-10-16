import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { MatchResults, PublicPlayer, ServerMessage } from '../../shared/protocol'
import { onMsg, sendMsg } from '../lib/socket'

export interface InputEvent {
  playerId: string
  type: string
  payload: unknown
}

interface GameContextValue {
  inputs: InputEvent[]
  statePatch: unknown
  clearInputs: () => void
  sendState: (patch: unknown) => void
  sendInput: (type: string, payload?: unknown) => void
  endGame: (results: MatchResults) => void
}

const GameCtx = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<InputEvent[]>([])
  const [statePatch, setStatePatch] = useState<unknown>(null)

  useEffect(() => {
    return onMsg((m: ServerMessage) => {
      if (m.t === 'input') {
        setInputs((prev) => [
          ...prev.slice(-300),
          { playerId: m.playerId, type: m.type, payload: m.payload },
        ])
      } else if (m.t === 'game:state') {
        setStatePatch(m.patch)
      }
    })
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      inputs,
      statePatch,
      clearInputs: () => setInputs([]),
      sendState: (patch) => sendMsg({ t: 'game:state', patch }),
      sendInput: (type, payload) => sendMsg({ t: 'game:input', type, payload }),
      endGame: (results) => sendMsg({ t: 'game:end', results }),
    }),
    [inputs, statePatch],
  )

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameCtx)
  if (!ctx) throw new Error('useGame outside GameProvider')
  return ctx
}

/** Screen-side helper: consume inputs with a ref-friendly accessor. */
export function useInputHandler(handler: (e: InputEvent) => void): void {
  const { inputs } = useGame()
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  const seenRef = useRef(0)
  useEffect(() => {
    if (inputs.length > seenRef.current) {
      for (let i = seenRef.current; i < inputs.length; i++) handlerRef.current(inputs[i])
      seenRef.current = inputs.length
    }
  }, [inputs])
}

/** Controller-side helper: latest typed state patch. */
export function useTypedPatch<T>(): T | null {
  const { statePatch } = useGame()
  return statePatch as T | null
}

export interface GameScreenProps {
  players: PublicPlayer[]
  seed: number
  onEnd: (results: MatchResults) => void
}

export interface GameCtrlProps {
  self: PublicPlayer | null
}

/** Seeded PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

export function pickOne<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function toResults(
  gameId: string,
  players: PublicPlayer[],
  scores: Record<string, number>,
  metaFor?: (playerId: string) => Record<string, unknown> | undefined,
): MatchResults {
  const entries = players
    .map((p) => ({
      playerId: p.id,
      name: p.name,
      avatarId: p.avatarId,
      colorIdx: p.colorIdx,
      value: scores[p.id] ?? 0,
      rank: 0,
      meta: metaFor?.(p.id),
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .map((e, i) => ({ ...e, rank: i + 1 }))
  return { gameId, entries }
}
