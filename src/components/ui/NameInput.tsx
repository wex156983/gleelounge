interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export function NameInput({ value, onChange, disabled }: Props) {
  return (
    <div className="w-full max-w-sm space-y-1">
      <label htmlFor="player-name" className="block text-sm font-semibold text-text-muted">
        Your name
      </label>
      <div className="flex gap-2">
        <input
          id="player-name"
          value={value}
          disabled={disabled}
          maxLength={12}
          autoComplete="nickname"
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-14 px-4 rounded-md bg-surface border-2 border-border-input text-lg font-semibold text-text placeholder:text-text-muted/50 focus:border-accent outline-none disabled:opacity-50"
          placeholder="Enter a name"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const adj = ['Swift', 'Lucky', 'Cosmic', 'Silky', 'Wild', 'Zesty', 'Merry', 'Prime']
            const noun = ['Falcon', 'Panda', 'Comet', 'Otter', 'Tiger', 'Wizard', 'Ranger', 'Pixel']
            onChange(`${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}`)
          }}
          aria-label="Randomize name"
          className="w-14 h-14 rounded-md bg-surface border-2 border-border-input text-xl hover:bg-surface-hover transition-colors duration-fast ease-out disabled:opacity-50"
        >
          🎲
        </button>
      </div>
    </div>
  )
}
