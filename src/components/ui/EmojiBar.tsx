import { useEffect, useState } from 'react'
import { EMOJIS } from '../../../shared/protocol'
import { sendMsg } from '../../lib/net'

interface Props {
  cooldownMs?: number
}

export function EmojiBar({ cooldownMs = 3000 }: Props) {
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [burst, setBurst] = useState<{ emoji: string; id: number } | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return
    const t = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(t)
  }, [cooldownUntil])

  const onCooldown = now < cooldownUntil

  function fire(emoji: string) {
    if (onCooldown) return
    sendMsg({ t: 'player:emoji', emoji })
    setBurst({ emoji, id: Date.now() })
    setCooldownUntil(Date.now() + cooldownMs)
    setNow(Date.now())
  }

  return (
    <div className="relative flex items-center justify-center gap-2">
      {burst && (
        <span
          key={burst.id}
          aria-hidden
          className="animate-float absolute -top-8 text-3xl pointer-events-none"
        >
          {burst.emoji}
        </span>
      )}
      {EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => fire(e)}
          disabled={onCooldown}
          aria-label={`React ${e}`}
          className="w-12 h-12 rounded-pill bg-surface text-2xl flex items-center justify-center hover:bg-surface-hover transition-colors duration-fast ease-out disabled:opacity-40 active:scale-95"
        >
          {e}
        </button>
      ))}
    </div>
  )
}
