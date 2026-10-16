import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cta'
type Size = 'sm' | 'md' | 'lg' | 'tv'

const variantCls: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'bg-surface-hover text-text border border-border hover:border-border-input',
  ghost: 'bg-transparent text-text-muted hover:text-text hover:bg-surface',
  danger: 'bg-danger text-on-danger hover:opacity-90',
  cta: 'bg-accent text-on-accent hover:bg-accent-hover shadow-glow',
}

const sizeCls: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-sm',
  md: 'h-10 px-4 text-base rounded-md',
  lg: 'h-12 px-6 text-lg rounded-md',
  tv: 'h-16 px-8 text-xl rounded-lg',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-fast ease-out active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${variantCls[variant]} ${sizeCls[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        />
      )}
      {children}
    </button>
  )
}
