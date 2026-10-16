interface Props {
  label: string
  active: boolean
  onClick: () => void
}

export function FilterChip({ label, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors duration-fast ease-out ${
        active
          ? 'bg-accent text-on-accent'
          : 'bg-surface text-text-muted hover:bg-surface-hover hover:text-text'
      }`}
    >
      {label}
    </button>
  )
}
