import { useEffect, useRef, useState } from 'react'

interface Props {
  onSeq: (seq: number[]) => void
  expectLen: number
  locked?: boolean
  wrong?: boolean
}

const PAD_COLORS = ['var(--player-1)', 'var(--player-2)', 'var(--player-3)', 'var(--player-4)']

export function SequencePad({ onSeq, expectLen, locked, wrong }: Props) {
  const [taps, setTaps] = useState<number[]>([])
  const [flash, setFlash] = useState<number | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])

  function tap(i: number) {
    if (locked || wrong) return
    setFlash(i)
    const t = window.setTimeout(() => setFlash(null), 150)
    timers.current.push(t)
    const next = [...taps, i]
    setTaps(next)
    if (next.length >= expectLen) onSeq(next)
  }

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-xs mx-auto" role="group" aria-label="Sequence pads">
      {[0, 1, 2, 3].map((i) => (
        <button
          key={i}
          aria-label={`Pad ${i + 1}`}
          disabled={locked || wrong}
          onPointerDown={() => tap(i)}
          className={`aspect-square rounded-lg border-2 transition-all duration-fast ease-out active:scale-95 ${
            wrong ? 'opacity-40' : ''
          } ${flash === i ? 'scale-95 brightness-150' : ''}`}
          style={{
            background: PAD_COLORS[i],
            borderColor: flash === i ? 'var(--color-text)' : 'transparent',
          }}
        />
      ))}
    </div>
  )
}
