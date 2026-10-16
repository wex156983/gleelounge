import type { GameMeta } from '../../../shared/protocol'

interface Props {
  game: GameMeta
  selected?: boolean
  onClick?: () => void
  size?: 'md' | 'lg'
}

export function GameCard({ game, selected, onClick, size = 'md' }: Props) {
  return (
    <button
      onClick={onClick}
      className={`group text-left rounded-lg overflow-hidden bg-surface border-2 transition-all duration-fast ease-out hover:border-accent hover:-translate-y-1 focus-visible:border-accent ${
        selected ? 'border-accent shadow-glow' : 'border-transparent'
      }`}
      aria-pressed={selected}
    >
      <div
        className={`${size === 'lg' ? 'h-40' : 'h-28'} bg-gradient-to-br ${game.coverGradient} flex items-center justify-center`}
      >
        <span className={`${size === 'lg' ? 'text-7xl' : 'text-5xl'}`} aria-hidden>
          {game.coverEmoji}
        </span>
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-tight">{game.title}</h3>
          {game.hasSolo && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-hover text-text-muted px-1.5 py-0.5 rounded-sm shrink-0">
              Solo
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted">
          {game.playersMin}–{game.playersMax} players · <span className="capitalize">{game.genre}</span>
        </p>
      </div>
    </button>
  )
}
