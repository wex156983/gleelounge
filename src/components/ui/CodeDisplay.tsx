import { useState } from 'react'
import { Button } from './Button'

interface Props {
  code: string
  size?: 'tv' | 'phone'
}

export function CodeDisplay({ code, size = 'tv' }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`font-mono font-bold tracking-[0.2em] text-on-accent select-all ${
          size === 'tv' ? 'text-code' : 'text-display-lg'
        }`}
        style={{
          color: 'var(--color-text)',
          textShadow: '0 0 32px rgba(110,69,245,0.5)',
        }}
        aria-live="polite"
      >
        {code}
      </div>
      <Button variant="ghost" size="sm" onClick={copy}>
        {copied ? '✓ Copied' : 'Copy code'}
      </Button>
    </div>
  )
}
