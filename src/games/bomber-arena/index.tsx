import { useEffect, useRef, useState } from 'react'
import {
  useGame,
  useInputHandler,
  useTypedPatch,
  toResults,
  type GameCtrlProps,
  type GameScreenProps,
} from '../runtime'
import { Dpad, ActionButton, type DpadState } from '../../controllers/Dpad'

const COLS = 13
const ROWS = 11
const TILE = 44
const BOMB_FUSE = 2.2
const EXPLOSION_MS = 500
const POWER_RANGE = 2

type Cell = 'empty' | 'wall' | 'crate'

interface Bomb {
  x: number
  y: number
  owner: string
  placedAt: number
  range: number
}

interface Explosion {
  cells: [number, number][]
  until: number
}

interface PlayerState {
  x: number
  y: number
  alive: boolean
  power: number
  bombsLeft: number
}

interface Patch {
  alive: string[]
}

function buildGrid(seedRng: () => number): Cell[][] {
  const g: Cell[][] = []
  for (let y = 0; y < ROWS; y++) {
    const row: Cell[] = []
    for (let x = 0; x < COLS; x++) {
      const wall = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1 || (x % 2 === 0 && y % 2 === 0)
      if (wall) row.push('wall')
      else if (seedRng() < 0.55) row.push('crate')
      else row.push('empty')
    }
    g.push(row)
  }
  // clear spawn corners
  const spawns: [number, number][] = [
    [1, 1],
    [COLS - 2, 1],
    [1, ROWS - 2],
    [COLS - 2, ROWS - 2],
    [Math.floor(COLS / 2), 1],
    [Math.floor(COLS / 2), ROWS - 2],
  ]
  for (const [x, y] of spawns) {
    if (g[y]?.[x] === 'crate') g[y][x] = 'empty'
  }
  return g
}

export const BomberArena = {
  Screen({ players, seed }: GameScreenProps) {
    const { sendState, endGame } = useGame()
    const rngRef = useRef<(() => number) | null>(null)
    if (!rngRef.current) {
      let s = seed >>> 0
      rngRef.current = () => {
        s = (s * 1664525 + 1013904223) >>> 0
        return s / 4294967296
      }
    }
    const gridRef = useRef<Cell[][]>(buildGrid(rngRef.current))
    const spawns: [number, number][] = [
      [1, 1],
      [COLS - 2, 1],
      [1, ROWS - 2],
      [COLS - 2, ROWS - 2],
      [Math.floor(COLS / 2), 1],
      [Math.floor(COLS / 2), ROWS - 2],
    ]
    const stateRef = useRef<Map<string, PlayerState>>(
      new Map(
        players.map((p, i) => [
          p.id,
          { x: spawns[i % spawns.length][0], y: spawns[i % spawns.length][1], alive: true, power: 1, bombsLeft: 1 },
        ]),
      ),
    )
    const bombsRef = useRef<Bomb[]>([])
    const explosionsRef = useRef<Explosion[]>([])
    const dirsRef = useRef<Record<string, DpadState>>({})
    const [, forceDraw] = useState(0)
    const endedRef = useRef(false)
    const startRef = useRef(Date.now())

    useInputHandler((e) => {
      if (e.type === 'dir') dirsRef.current[e.playerId] = e.payload as DpadState
      else if (e.type === 'bomb') {
        const ps = stateRef.current.get(e.playerId)
        if (!ps?.alive || ps.bombsLeft <= 0) return
        if (bombsRef.current.some((b) => b.x === ps.x && b.y === ps.y)) return
        if (gridRef.current[ps.y]?.[ps.x] === 'wall') return
        bombsRef.current.push({ x: ps.x, y: ps.y, owner: e.playerId, placedAt: performance.now(), range: POWER_RANGE })
        ps.bombsLeft -= 1
      }
    })

    useEffect(() => {
      let raf: number
      let last = performance.now()
      const MOVE_MS = 140

      const loop = (now: number) => {
        const dt = now - last
        if (dt >= MOVE_MS) {
          last = now
          // movement
          for (const [pid, ps] of stateRef.current) {
            if (!ps.alive) continue
            const d = dirsRef.current[pid]
            if (!d) continue
            let nx = ps.x
            let ny = ps.y
            if (d.left) nx -= 1
            else if (d.right) nx += 1
            else if (d.up) ny -= 1
            else if (d.down) ny += 1
            if (nx !== ps.x || ny !== ps.y) {
              const cell = gridRef.current[ny]?.[nx]
              const bombThere = bombsRef.current.some((b) => b.x === nx && b.y === ny)
              if (cell === 'empty' && !bombThere) {
                ps.x = nx
                ps.y = ny
              }
            }
          }
          // bombs
          for (const b of [...bombsRef.current]) {
            if (now - b.placedAt >= BOMB_FUSE * 1000) {
              bombsRef.current = bombsRef.current.filter((x) => x !== b)
              const cells: [number, number][] = [[b.x, b.y]]
              for (const [dx, dy] of [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
              ] as const) {
                for (let r = 1; r <= b.range; r++) {
                  const cx = b.x + dx * r
                  const cy = b.y + dy * r
                  const cell = gridRef.current[cy]?.[cx]
                  if (cell === 'wall') break
                  cells.push([cx, cy])
                  if (cell === 'crate') {
                    gridRef.current[cy][cx] = 'empty'
                    break
                  }
                }
              }
              explosionsRef.current.push({ cells, until: now + EXPLOSION_MS })
              // refill bomb
              const owner = stateRef.current.get(b.owner)
              if (owner) owner.bombsLeft = Math.min(owner.bombsLeft + 1, 1)
            }
          }
          // damage
          const active = explosionsRef.current.filter((e) => e.until > now)
          explosionsRef.current = active
          const danger = new Set(active.flatMap((e) => e.cells.map(([x, y]) => `${x},${y}`)))
          for (const ps of stateRef.current.values()) {
            if (ps.alive && danger.has(`${ps.x},${ps.y}`)) ps.alive = false
          }
          // end check
          const alive = [...stateRef.current.entries()].filter(([, s]) => s.alive)
          if (alive.length <= 1 && !endedRef.current) {
            endedRef.current = true
            const scores: Record<string, number> = {}
            for (const [pid, ps2] of stateRef.current) scores[pid] = ps2.alive ? 100 : 0
            void startRef
            endGame(toResults('bomber-arena', players, scores, (pid) => ({ survived: stateRef.current.get(pid)?.alive ?? false })))
          }
          sendState({ alive: [...stateRef.current.entries()].filter(([, s]) => s.alive).map(([pid]) => pid) } satisfies Patch)
          forceDraw((n) => n + 1)
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
      return () => cancelAnimationFrame(raf)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const grid = gridRef.current
    const now = performance.now()
    const active = explosionsRef.current.filter((e) => e.until > now)
    const danger = new Set(active.flatMap((e) => e.cells.map(([x, y]) => `${x},${y}`)))

    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-display font-bold">Bomber Arena</div>
        <div className="relative" style={{ width: COLS * TILE, height: ROWS * TILE }}>
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x},${y}`}
                className="absolute flex items-center justify-center"
                style={{ left: x * TILE, top: y * TILE, width: TILE, height: TILE }}
              >
                {cell === 'wall' && <div className="w-full h-full bg-border rounded-sm" />}
                {cell === 'crate' && (
                  <div className="w-[92%] h-[92%] rounded-sm" style={{ background: 'linear-gradient(135deg,#b9863f,#7a5626)' }} />
                )}
                {danger.has(`${x},${y}`) && <div className="absolute inset-0 bg-warning/70 rounded-full animate-pulse" />}
              </div>
            )),
          )}
          {bombsRef.current.map((b, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-bg border-4 border-text"
              style={{ left: b.x * TILE + 6, top: b.y * TILE + 6, width: TILE - 12, height: TILE - 12 }}
            />
          ))}
          {[...stateRef.current.entries()].map(([pid, ps]) => {
            if (!ps.alive) return null
            const p = players.find((pl) => pl.id === pid)
            return (
              <div
                key={pid}
                className="absolute rounded-full flex items-center justify-center text-xl transition-all duration-100"
                style={{
                  left: ps.x * TILE + 4,
                  top: ps.y * TILE + 4,
                  width: TILE - 8,
                  height: TILE - 8,
                  background: `var(--player-${(p?.colorIdx ?? 0) + 1})`,
                }}
              >
                {p?.avatarId}
              </div>
            )
          })}
        </div>
        <div className="flex gap-4">
          {players.map((p) => {
            const ps = stateRef.current.get(p.id)
            return (
              <div key={p.id} className={`text-sm font-bold ${ps?.alive ? '' : 'line-through opacity-40'}`}>
                {p.avatarId} {p.name}
              </div>
            )
          })}
        </div>
      </div>
    )
  },

  Controller({ self }: GameCtrlProps) {
    const { sendInput } = useGame()
    const patch = useTypedPatch<Patch>()
    const alive = !patch || !self || patch.alive.includes(self.id)

    if (!alive) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-6 safe-pb">
          <div className="text-6xl">💥</div>
          <p className="text-xl font-bold">You're out!</p>
          <p className="text-text-muted">Watch the big screen for the result</p>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-around h-full p-4 safe-pb">
        <Dpad
          onChange={(s) => {
            sendInput('dir', s)
          }}
        />
        <ActionButton
          onAction={() => sendInput('bomb', Date.now())}
          label="Drop bomb"
          emoji="💣"
        />
      </div>
    )
  },
}
