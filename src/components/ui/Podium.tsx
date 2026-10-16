import { useMemo } from 'react'
import type { MatchResultEntry } from '../../../shared/protocol'
import { AvatarChip } from './AvatarChip'

interface Props {
  entries: MatchResultEntry[]
}

const CONFETTI_COLORS = [
  'var(--player-1)',
  'var(--player-2)',
  'var(--player-3)',
  'var(--player-4)',
  'var(--player-5)',
  'var(--player-6)',
]

export function Podium({ entries }: Props) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.rank - b.rank).slice(0, 3),
    [entries],
  )
  const first = sorted.find((e) => e.rank === 1)
  const second = sorted.find((e) => e.rank === 2)
  const third = sorted.find((e) => e.rank === 3)
  const order = [second, first, third].filter(Boolean) as MatchResultEntry[]

  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 10) * 0.15}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + (i % 4) * 3,
      })),
    [],
  )

  return (
    <div className="relative" aria-label="Podium">
      {first &&
        confetti.map((c) => (
          <span
            key={c.id}
            aria-hidden
            className="animate-confetti absolute top-0 pointer-events-none"
            style={{
              left: c.left,
              animationDelay: c.delay,
              width: c.size,
              height: c.size * 0.6,
              background: c.color,
              borderRadius: 2,
            }}
          />
        ))}
      <div className="flex items-end justify-center gap-4 pt-8">
        {order.map((e) => {
          const h = e.rank === 1 ? 'h-36' : e.rank === 2 ? 'h-28' : 'h-20'
          return (
            <div key={e.playerId} className="flex flex-col items-center gap-2 w-32">
              <AvatarChip
                player={{
                  name: e.name,
                  avatarId: e.avatarId,
                  colorIdx: e.colorIdx,
                  isHost: false,
                  ready: false,
                  connected: true,
                }}
                size={e.rank === 1 ? 'lg' : 'md'}
              />
              <div className="font-bold text-lg">{e.name}</div>
              <div className="font-mono text-text-muted">{e.value}</div>
              <div
                className={`${h} w-full rounded-t-md flex items-start justify-center pt-2 text-3xl font-bold`}
                style={{
                  background: `var(--player-${e.colorIdx + 1})`,
                  color: 'var(--color-bg)',
                }}
              >
                {e.rank === 1 ? '🏆' : e.rank}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
