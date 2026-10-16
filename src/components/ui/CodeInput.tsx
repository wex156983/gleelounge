import { useEffect, useRef, useState } from 'react'

interface Props {
  onComplete: (code: string) => void
  invalid?: boolean
  disabled?: boolean
  autoFocus?: boolean
  initial?: string
}

const LEN = 4

export function CodeInput({ onComplete, invalid, disabled, autoFocus, initial }: Props) {
  const [chars, setChars] = useState<string[]>(() => {
    const seed = (initial ?? '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, LEN)
    const arr: string[] = Array(LEN).fill('')
    for (let i = 0; i < seed.length; i++) arr[i] = seed[i]
    return arr
  })
  const [focus, setFocus] = useState(0)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  useEffect(() => {
    if (chars.every((c) => c)) onComplete(chars.join(''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars])

  function setChar(i: number, v: string) {
    const up = v.replace(/[^a-zA-Z]/, '').toUpperCase().slice(-1)
    const next = [...chars]
    next[i] = up
    setChars(next)
    if (up && i < LEN - 1) refs.current[i + 1]?.focus()
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !chars[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/[^a-zA-Z]/g, '').toUpperCase()
    if (!text) return
    e.preventDefault()
    const next = Array(LEN).fill('')
    for (let i = 0; i < Math.min(LEN, text.length); i++) next[i] = text[i]
    setChars(next)
    refs.current[Math.min(LEN - 1, text.length - 1)]?.focus()
  }

  return (
    <div
      className={`flex gap-3 ${invalid ? 'animate-shake' : ''}`}
      onPaste={onPaste}
      role="group"
      aria-label="Room code"
    >
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={c}
          disabled={disabled}
          inputMode="text"
          autoComplete="off"
          aria-label={`Code letter ${i + 1}`}
          maxLength={1}
          onFocus={() => setFocus(i)}
          onChange={(e) => setChar(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          className={`w-16 h-20 text-center text-display-lg font-mono font-bold uppercase bg-surface rounded-md border-2 transition-colors duration-fast ease-out text-text placeholder:text-text-muted/40 ${
            invalid
              ? 'border-danger'
              : focus === i
                ? 'border-accent'
                : 'border-border-input'
          }`}
          placeholder="·"
        />
      ))}
      {invalid && (
        <span role="alert" className="sr-only">
          Invalid room code
        </span>
      )}
    </div>
  )
}
