interface Props {
  armed: boolean
  onTap: () => void
  disabled?: boolean
}

export function ReactionButton({ armed, onTap, disabled }: Props) {
  return (
    <button
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault()
        onTap()
      }}
      aria-label={armed ? 'Tap now!' : 'Wait for green'}
      className={`w-full max-w-sm aspect-[4/3] rounded-xl text-display-lg font-bold select-none touch-none transition-colors duration-fast ease-out shadow-pop ${
        armed
          ? 'bg-success text-on-success animate-pulse'
          : 'bg-surface text-text-muted border-2 border-border'
      } disabled:opacity-60`}
    >
      {armed ? 'TAP!' : 'Wait…'}
    </button>
  )
}
