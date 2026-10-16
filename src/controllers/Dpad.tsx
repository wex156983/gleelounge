export interface DpadState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

interface Props {
  onChange: (s: DpadState) => void
}

export function Dpad({ onChange }: Props) {
  const state: DpadState = { up: false, down: false, left: false, right: false }

  function press(dir: keyof DpadState, v: boolean) {
    state[dir] = v
    onChange({ ...state })
  }

  const btn =
    'w-20 h-20 bg-surface border-2 border-border-input rounded-md flex items-center justify-center text-3xl font-bold select-none touch-none active:bg-accent active:text-on-accent transition-colors duration-fast ease-out'

  return (
    <div className="grid grid-cols-3 gap-1 select-none" role="group" aria-label="Direction pad">
      <span />
      <button
        aria-label="Up"
        className={btn}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          press('up', true)
        }}
        onPointerUp={() => press('up', false)}
        onPointerCancel={() => press('up', false)}
      >
        ▲
      </button>
      <span />
      <button
        aria-label="Left"
        className={btn}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          press('left', true)
        }}
        onPointerUp={() => press('left', false)}
        onPointerCancel={() => press('left', false)}
      >
        ◀
      </button>
      <span />
      <button
        aria-label="Right"
        className={btn}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          press('right', true)
        }}
        onPointerUp={() => press('right', false)}
        onPointerCancel={() => press('right', false)}
      >
        ▶
      </button>
      <span />
      <button
        aria-label="Down"
        className={btn}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          press('down', true)
        }}
        onPointerUp={() => press('down', false)}
        onPointerCancel={() => press('down', false)}
      >
        ▼
      </button>
      <span />
    </div>
  )
}

interface ActionProps {
  onAction: () => void
  label?: string
  emoji?: string
}

export function ActionButton({ onAction, label = 'Action', emoji = '💣' }: ActionProps) {
  return (
    <button
      aria-label={label}
      className="w-24 h-24 rounded-pill bg-danger text-on-danger text-4xl flex items-center justify-center select-none touch-none active:scale-95 transition-transform duration-fast ease-out shadow-pop"
      onPointerDown={(e) => {
        e.preventDefault()
        onAction()
      }}
    >
      <span aria-hidden>{emoji}</span>
    </button>
  )
}
