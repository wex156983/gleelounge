import { useRef } from 'react'

interface Props {
  onAxis: (x: number, y: number) => void
}

export function Joystick({ onAxis }: Props) {
  const baseRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const state = useRef({ active: false, id: -1 })

  const BASE = 120
  const THUMB = 56
  const MAX = (BASE - THUMB) / 2

  function handle(clientX: number, clientY: number) {
    const el = baseRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    let dx = clientX - cx
    let dy = clientY - cy
    const dist = Math.hypot(dx, dy)
    if (dist > MAX) {
      dx = (dx / dist) * MAX
      dy = (dy / dist) * MAX
    }
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translate(${dx}px, ${dy}px)`
    }
    onAxis(dx / MAX, dy / MAX)
  }

  function reset() {
    state.current = { active: false, id: -1 }
    if (thumbRef.current) thumbRef.current.style.transform = 'translate(0,0)'
    onAxis(0, 0)
  }

  return (
    <div
      ref={baseRef}
      className="relative rounded-pill bg-surface border-2 border-border-input touch-none select-none"
      style={{ width: BASE, height: BASE }}
      onPointerDown={(e) => {
        state.current = { active: true, id: e.pointerId }
        e.currentTarget.setPointerCapture(e.pointerId)
        handle(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => {
        if (state.current.active && e.pointerId === state.current.id) handle(e.clientX, e.clientY)
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
      role="application"
      aria-label="Joystick"
    >
      <div
        ref={thumbRef}
        className="absolute left-1/2 top-1/2 -ml-7 -mt-7 rounded-pill bg-accent shadow-glow pointer-events-none"
        style={{ width: THUMB, height: THUMB }}
      />
    </div>
  )
}
