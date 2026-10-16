import { useEffect, useRef, useState } from 'react'
import {
  useGame,
  useInputHandler,
  useTypedPatch,
  mulberry32,
  toResults,
  type GameCtrlProps,
  type GameScreenProps,
} from '../runtime'
import { Joystick } from '../../controllers/Joystick'

const LAPS = 3
const TRACK_W = 960
const TRACK_H = 540
const KART_R = 14

// oval-ish track defined as a series of waypoints
const WAYPOINTS: [number, number][] = [
  [160, 120],
  [800, 120],
  [880, 270],
  [800, 420],
  [160, 420],
  [80, 270],
]

interface Kart {
  playerId: string
  x: number
  y: number
  angle: number
  speed: number
  lap: number
  cp: number
  finished: boolean
  finishTime: number | null
}

interface Patch {
  standings: { playerId: string; lap: number; finished: boolean }[]
}

function nearestWaypoint(x: number, y: number): { idx: number; dist: number } {
  let best = { idx: 0, dist: Infinity }
  for (let i = 0; i < WAYPOINTS.length; i++) {
    const d = Math.hypot(x - WAYPOINTS[i][0], y - WAYPOINTS[i][1])
    if (d < best.dist) best = { idx: i, dist: d }
  }
  return best
}

function pointToSegmentDist(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function trackWidthAt(x: number, y: number): number {
  let min = Infinity
  for (let i = 0; i < WAYPOINTS.length; i++) {
    const a = WAYPOINTS[i]
    const b = WAYPOINTS[(i + 1) % WAYPOINTS.length]
    min = Math.min(min, pointToSegmentDist(x, y, a[0], a[1], b[0], b[1]))
  }
  return min
}

export const Karts = {
  Screen({ players, seed }: GameScreenProps) {
    const { sendState, endGame } = useGame()
    const rng = useRef(mulberry32(seed)).current
    void rng
    const kartsRef = useRef<Kart[]>(
      players.map((p, i) => {
        const angle = (i / players.length) * Math.PI * 0.5 - Math.PI * 0.25
        return {
          playerId: p.id,
          x: WAYPOINTS[0][0] + Math.cos(angle + Math.PI) * 30,
          y: WAYPOINTS[0][1] + Math.sin(angle + Math.PI) * 30,
          angle: 0,
          speed: 0,
          lap: 0,
          cp: 0,
          finished: false,
          finishTime: null,
        }
      }),
    )
    const axesRef = useRef<Record<string, { x: number; y: number }>>({})
    const [tick, setTick] = useState(0)
    const [started, setStarted] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const doneRef = useRef(false)

    useInputHandler((e) => {
      if (e.type === 'axis') {
        axesRef.current[e.playerId] = e.payload as { x: number; y: number }
      }
    })

    useEffect(() => {
      const t = setInterval(() => setCountdown((c) => c - 1), 1000)
      const t2 = setTimeout(() => setStarted(true), 3200)
      return () => {
        clearInterval(t)
        clearTimeout(t2)
      }
    }, [])

    useEffect(() => {
      if (!started) return
      let raf: number
      let last = performance.now()
      const step = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        const karts = kartsRef.current
        for (const k of karts) {
          if (k.finished) continue
          const axis = axesRef.current[k.playerId] ?? { x: 0, y: 0 }
          const throttle = -axis.y // stick up = accelerate
          k.speed += throttle * 260 * dt
          k.speed *= 0.985
          k.speed = Math.max(-80, Math.min(260, k.speed))
          k.angle += axis.x * 2.4 * dt * (k.speed >= 0 ? 1 : -1) * Math.min(1, Math.abs(k.speed) / 60)
          k.x += Math.cos(k.angle) * k.speed * dt
          k.y += Math.sin(k.angle) * k.speed * dt
          // wall check
          if (trackWidthAt(k.x, k.y) > 62) {
            k.speed *= -0.3
            k.x -= Math.cos(k.angle) * 4
            k.y -= Math.sin(k.angle) * 4
          }
          // checkpoint / lap logic
          const near = nearestWaypoint(k.x, k.y)
          const expect = (k.cp + 1) % WAYPOINTS.length
          if (near.idx === expect && near.dist < 90) {
            k.cp = expect
            if (expect === 0) {
              k.lap += 1
              if (k.lap >= LAPS) {
                k.finished = true
                k.finishTime = now
              }
            }
          }
        }
        const finishedCount = karts.filter((k) => k.finished).length
        if (finishedCount === karts.length || (karts.length > 0 && finishedCount >= 1 && now - (karts.find((k) => k.finished)?.finishTime ?? now) > 8000)) {
          if (!doneRef.current) {
            doneRef.current = true
            const order = [...karts].sort((a, b) => {
              if (a.finished && b.finished) return (a.finishTime ?? 0) - (b.finishTime ?? 0)
              if (a.finished) return -1
              if (b.finished) return 1
              return b.lap - a.lap
            })
            const scores: Record<string, number> = {}
            order.forEach((k, i) => {
              scores[k.playerId] = (order.length - i) * 100 + (k.finished ? 50 : 0)
            })
            endGame(toResults('karts', players, scores))
            return
          }
        }
        setTick((t) => t + 1)
        sendState({
          standings: karts.map((k) => ({ playerId: k.playerId, lap: k.lap, finished: k.finished })),
        } satisfies Patch)
        raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
      return () => cancelAnimationFrame(raf)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started])

    void tick
    const karts = kartsRef.current
    const nameOf = Object.fromEntries(players.map((p) => [p.id, p.name]))

    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-bg/80">
            <div className="text-code font-bold animate-pop">{countdown > 0 ? countdown : 'GO!'}</div>
          </div>
        )}
        <svg viewBox={`0 0 ${TRACK_W} ${TRACK_H}`} className="w-full max-w-5xl rounded-lg bg-[#1a2634]">
          <polygon
            points={WAYPOINTS.map((w) => w.join(',')).join(' ')}
            fill="none"
            stroke="#2e4a32"
            strokeWidth="120"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <polygon
            points={WAYPOINTS.map((w) => w.join(',')).join(' ')}
            fill="none"
            stroke="#3d6644"
            strokeWidth="100"
            strokeLinejoin="round"
          />
          {karts.map((k, i) => (
            <g key={k.playerId} transform={`translate(${k.x},${k.y}) rotate(${(k.angle * 180) / Math.PI})`}>
              <rect x={-KART_R} y={-KART_R / 1.5} width={KART_R * 2} height={KART_R * 1.4} rx={4} fill={`var(--player-${(players[i]?.colorIdx ?? 0) + 1})`} stroke="#0b0e14" strokeWidth="2" />
              <circle cx={KART_R - 3} cy={0} r={3} fill="#f2f5fa" />
            </g>
          ))}
        </svg>
        <div className="flex gap-6 flex-wrap justify-center">
          {players.map((p) => {
            const k = karts.find((kk) => kk.playerId === p.id)
            return (
              <div key={p.id} className="text-sm font-bold flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-sm inline-block"
                  style={{ background: `var(--player-${p.colorIdx + 1})` }}
                />
                {p.name} — lap {Math.min(LAPS, (k?.lap ?? 0) + 1)}/{LAPS}
              </div>
            )
          })}
        </div>
        {Object.keys(axesRef.current).length === 0 && (
          <p className="text-text-muted text-sm">Waiting for controllers… move your joystick!</p>
        )}
        {void nameOf}
      </div>
    )
  },

  Controller({ self }: GameCtrlProps) {
    const { sendInput } = useGame()
    const patch = useTypedPatch<Patch>()
    const lastSent = useRef(0)
    const myStanding = patch?.standings?.find((s) => s.playerId === self?.id)

    return (
      <div className="flex flex-col items-center justify-center gap-8 h-full p-6 safe-pb">
        <p className="text-text-muted font-semibold">Steer with the stick — up to accelerate</p>
        <Joystick
          onAxis={(x, y) => {
            const now = performance.now()
            if (now - lastSent.current < 33) return // ~30 Hz
            lastSent.current = now
            sendInput('axis', { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) })
          }}
        />
        <div className="text-sm text-text-muted">
          {myStanding?.finished ? 'Finished! 🏁' : `Lap ${Math.min(LAPS, (myStanding?.lap ?? 0) + 1)}/${LAPS}`}
        </div>
      </div>
    )
  },
}
