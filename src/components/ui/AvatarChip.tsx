import type { PublicPlayer } from '../../../shared/protocol'

const playerBg = (idx: number) => `var(--player-${(idx % 8) + 1})`

interface Props {
  player: Pick<PublicPlayer, 'name' | 'avatarId' | 'colorIdx' | 'isHost' | 'ready' | 'connected'>
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

const sizeCls = { sm: 'w-10 h-10 text-lg', md: 'w-14 h-14 text-2xl', lg: 'w-20 h-20 text-4xl' }

export function AvatarChip({ player, size = 'sm', showName = true }: Props) {
  const disconnected = !player.connected
  return (
    <div
      className={`flex flex-col items-center gap-1 ${disconnected ? 'opacity-50 grayscale' : ''}`}
      aria-label={`${player.name}${player.isHost ? ', host' : ''}${player.ready ? ', ready' : ''}${disconnected ? ', disconnected' : ''}`}
    >
      <div className="relative">
        <div
          className={`${sizeCls[size]} rounded-pill flex items-center justify-center bg-bg font-bold select-none`}
          style={{ backgroundColor: playerBg(player.colorIdx), color: 'var(--color-bg)' }}
        >
          <span aria-hidden>{player.avatarId}</span>
        </div>
        {player.isHost && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 text-xs"
            title="Host"
          >
            👑
          </span>
        )}
        {player.ready && !disconnected && (
          <span
            aria-hidden
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-pill bg-success text-on-success text-xs flex items-center justify-center"
          >
            ✓
          </span>
        )}
        {disconnected && (
          <span
            aria-hidden
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-pill bg-danger text-on-danger text-xs flex items-center justify-center"
          >
            ✕
          </span>
        )}
      </div>
      {showName && (
        <span className="text-xs font-semibold text-text-muted max-w-20 truncate">{player.name}</span>
      )}
    </div>
  )
}
