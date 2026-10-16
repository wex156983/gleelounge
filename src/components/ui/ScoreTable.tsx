import type { MatchResultEntry } from '../../../shared/protocol'
import { AvatarChip } from './AvatarChip'

interface Props {
  entries: MatchResultEntry[]
  compact?: boolean
}

export function ScoreTable({ entries, compact }: Props) {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank)
  return (
    <ol className="space-y-1" aria-label="Scores">
      {sorted.map((e) => (
        <li
          key={e.playerId}
          className={`flex items-center gap-3 rounded-md px-3 ${
            compact ? 'py-1' : 'py-2'
          } ${e.rank === 1 ? 'bg-surface-hover' : 'bg-surface/50'}`}
        >
          <span
            className={`font-bold w-6 text-center ${e.rank === 1 ? 'text-warning' : 'text-text-muted'}`}
            aria-label={`${e.rank} place`}
          >
            {e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : e.rank}
          </span>
          <AvatarChip
            player={{
              name: e.name,
              avatarId: e.avatarId,
              colorIdx: e.colorIdx,
              isHost: false,
              ready: false,
              connected: true,
            }}
            size="sm"
            showName={!compact}
          />
          {compact && <span className="text-sm font-semibold truncate">{e.name}</span>}
          <span className="ml-auto font-mono font-bold text-lg tabular-nums">{e.value}</span>
        </li>
      ))}
    </ol>
  )
}
