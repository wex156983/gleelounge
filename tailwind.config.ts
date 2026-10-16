import type { Config } from 'tailwindcss'

// Theme mapping for GleeLounge — tokens come from replica/design/tokens.json via tokens.css.
// Components must use these aliases (bg-surface, text-muted, rounded-lg...) never raw hex.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: 'var(--color-bg)', elevated: 'var(--color-bg-elevated)' },
        surface: { DEFAULT: 'var(--color-surface)', hover: 'var(--color-surface-hover)' },
        border: { DEFAULT: 'var(--color-border)', input: 'var(--color-border-input)' },
        text: { DEFAULT: 'var(--color-text)', muted: 'var(--color-text-muted)' },
        accent: { DEFAULT: 'var(--color-accent)', hover: 'var(--color-accent-hover)' },
        'on-accent': 'var(--color-on-accent)',
        danger: 'var(--color-danger)',
        'on-danger': 'var(--color-on-danger)',
        success: 'var(--color-success)',
        'on-success': 'var(--color-on-success)',
        warning: 'var(--color-warning)',
        'on-warning': 'var(--color-on-warning)',
        player: {
          1: 'var(--player-1)',
          2: 'var(--player-2)',
          3: 'var(--player-3)',
          4: 'var(--player-4)',
          5: 'var(--player-5)',
          6: 'var(--player-6)',
          7: 'var(--player-7)',
          8: 'var(--player-8)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: 'var(--text-xs--line)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--text-sm--line)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--text-base--line)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--text-lg--line)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--text-xl--line)' }],
        display: ['var(--text-display)', { lineHeight: 'var(--text-display--line)' }],
        'display-lg': ['var(--text-display-lg)', { lineHeight: 'var(--text-display-lg--line)' }],
        code: ['var(--text-code)', { lineHeight: 'var(--text-code--line)' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
        glow: 'var(--shadow-glow)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },
      maxWidth: {
        layout: 'var(--layout-max-width)',
      },
      minHeight: {
        'phone-tap': 'var(--layout-phone-tap-min)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config
