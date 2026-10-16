import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/ui/Button'

export interface Stroke {
  color: string
  points: number[] // flat [x0,y0,x1,y1,...] normalized 0..1
}

interface Props {
  onSend: (strokes: Stroke[]) => void
  locked?: boolean
}

const COLORS = ['#f2f5fa', '#ff5c6c', '#ffc857', '#3ddc97', '#4dabf7', '#cc5de8']
const W = 400
const H = 400

export function DrawPad({ onSend, locked }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState(COLORS[1])
  const strokesRef = useRef<Stroke[]>([])
  const currentRef = useRef<Stroke | null>(null)
  const [hasContent, setHasContent] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    c.width = W * dpr
    c.height = H * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 4
  }, [])

  function redraw() {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    ctx.clearRect(0, 0, W, H)
    for (const s of strokesRef.current) {
      ctx.strokeStyle = s.color
      ctx.beginPath()
      for (let i = 0; i < s.points.length; i += 2) {
        const x = s.points[i] * W
        const y = s.points[i + 1] * H
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }

  function pos(e: React.PointerEvent): [number, number] {
    const r = e.currentTarget.getBoundingClientRect()
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]
  }

  if (locked) {
    return (
      <div className="w-full aspect-square max-w-md mx-auto rounded-lg bg-surface border-2 border-border flex items-center justify-center">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} className="touch-none" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      <canvas
        ref={canvasRef}
        className="w-full aspect-square max-w-md mx-auto rounded-lg bg-white border-2 border-border touch-none cursor-crosshair"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          const [x, y] = pos(e)
          currentRef.current = { color, points: [x, y] }
          redraw()
        }}
        onPointerMove={(e) => {
          if (!currentRef.current) return
          const [x, y] = pos(e)
          const pts = currentRef.current.points
          const dx = x - pts[pts.length - 2]
          const dy = y - pts[pts.length - 1]
          if (Math.hypot(dx, dy) < 0.005) return
          pts.push(x, y)
          redraw()
          // draw the new segment live
          const ctx = e.currentTarget.getContext('2d')!
          ctx.strokeStyle = color
          ctx.beginPath()
          ctx.moveTo(pts[pts.length - 4] * W, pts[pts.length - 3] * H)
          ctx.lineTo(x * W, y * H)
          ctx.stroke()
        }}
        onPointerUp={() => {
          if (currentRef.current && currentRef.current.points.length >= 4) {
            strokesRef.current.push(currentRef.current)
            setHasContent(true)
            setStrokeCount(strokesRef.current.length)
          }
          currentRef.current = null
        }}
        onPointerCancel={() => {
          currentRef.current = null
        }}
      />
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            aria-label={`Color ${c}`}
            onClick={() => setColor(c)}
            className={`w-10 h-10 rounded-pill border-2 transition-transform duration-fast ease-out ${
              color === c ? 'border-accent scale-110' : 'border-border'
            }`}
            style={{ background: c }}
          />
        ))}
      </div>
      <div className="flex justify-center gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            strokesRef.current.pop()
            setStrokeCount(strokesRef.current.length)
            if (strokesRef.current.length === 0) setHasContent(false)
            redraw()
          }}
          disabled={strokeCount === 0}
        >
          Undo
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            strokesRef.current = []
            redraw()
            setHasContent(false)
          }}
          disabled={!hasContent}
        >
          Clear
        </Button>
        <Button onClick={() => onSend([...strokesRef.current])} disabled={!hasContent}>
          Send drawing
        </Button>
      </div>
    </div>
  )
}
