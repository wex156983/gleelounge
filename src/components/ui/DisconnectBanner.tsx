import { useEffect, useState } from 'react'
import { Button } from './Button'

interface Props {
  onRetry?: () => void
  forceShow?: boolean
}

export function DisconnectBanner({ onRetry, forceShow }: Props) {
  const [phase, setPhase] = useState<'hidden' | 'retrying' | 'failed' | 'ok'>('hidden')

  useEffect(() => {
    // socket.io client exposes this; we listen via custom events set up in the app root.
    function onDown() {
      setPhase('retrying')
    }
    function onUp() {
      setPhase('ok')
      setTimeout(() => setPhase('hidden'), 1000)
    }
    window.addEventListener('cp:disconnected', onDown)
    window.addEventListener('cp:reconnected', onUp)
    return () => {
      window.removeEventListener('cp:disconnected', onDown)
      window.removeEventListener('cp:reconnected', onUp)
    }
  }, [])

  const show = forceShow || phase !== 'hidden'
  if (!show) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 inset-x-0 z-50 safe-pt flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold ${
        phase === 'ok'
          ? 'bg-success text-on-success'
          : phase === 'failed'
            ? 'bg-danger text-on-danger'
            : 'bg-surface text-text border-b border-border'
      }`}
    >
      {phase === 'retrying' && (
        <>
          <span
            aria-hidden
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
          Reconnecting…
        </>
      )}
      {phase === 'failed' && (
        <>
          Couldn’t reconnect
          <Button size="sm" variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        </>
      )}
      {phase === 'ok' && 'Reconnected ✓'}
    </div>
  )
}
