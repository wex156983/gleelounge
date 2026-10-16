interface Props {
  options: string[]
  onPick: (idx: number) => void
  locked?: boolean
  picked?: number | null
  labels?: string[]
}

export function TapGrid({ options, onPick, locked, picked, labels = ['A', 'B', 'C', 'D'] }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto" role="group" aria-label="Answers">
      {options.map((opt, i) => {
        const isPicked = picked === i
        return (
          <button
            key={i}
            disabled={locked || picked != null}
            onClick={() => onPick(i)}
            className={`min-h-phone-tap w-full px-4 py-4 rounded-lg text-left text-lg font-semibold border-2 transition-all duration-fast ease-out ${
              isPicked
                ? 'bg-accent text-on-accent border-accent'
                : 'bg-surface border-border-input text-text hover:bg-surface-hover disabled:opacity-50'
            }`}
          >
            <span className="inline-flex items-center gap-3">
              <span
                className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm font-bold shrink-0 ${
                  isPicked ? 'bg-on-accent text-accent' : 'bg-surface-hover text-text-muted'
                }`}
              >
                {labels[i] ?? i + 1}
              </span>
              {opt}
            </span>
          </button>
        )
      })}
    </div>
  )
}
