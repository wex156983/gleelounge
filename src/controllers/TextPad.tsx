import { useState, type FormEvent } from 'react'
import { Button } from '../components/ui/Button'

interface Props {
  onSubmit: (word: string) => void
  locked?: boolean
  hint?: string
  maxLen?: number
  placeholder?: string
  ctaLabel?: string
}

export function TextPad({
  onSubmit,
  locked,
  hint,
  maxLen = 24,
  placeholder = 'Type a word…',
  ctaLabel = 'Send',
}: Props) {
  const [value, setValue] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    const w = value.trim()
    if (!w || locked) return
    onSubmit(w.toLowerCase())
    setValue('')
  }

  return (
    <form onSubmit={submit} className="w-full space-y-3">
      {hint && (
        <p className="text-center text-sm text-text-muted">
          Must match: <span className="font-bold text-text">{hint}</span>
        </p>
      )}
      <div className="flex gap-2">
        <input
          value={value}
          disabled={locked}
          maxLength={maxLen}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 h-14 px-4 rounded-md bg-surface border-2 border-border-input text-lg font-semibold text-text placeholder:text-text-muted/50 focus:border-accent outline-none disabled:opacity-50"
          aria-label="Your word"
        />
        <Button type="submit" size="lg" disabled={locked || !value.trim()}>
          {ctaLabel}
        </Button>
      </div>
      {locked && <p className="text-center text-success font-semibold">Locked in — waiting for others</p>}
    </form>
  )
}
