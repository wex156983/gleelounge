import type { GameMeta } from './protocol'

// Pure metadata — no React. The client registry attaches Screen/Controller components.
export const GAMES: GameMeta[] = [
  {
    id: 'reaction-duel',
    title: 'Reaction Duel',
    genre: 'party',
    playersMin: 2,
    playersMax: 8,
    hasSolo: false,
    controls: 'reaction',
    description:
      'The screen flashes green at a random moment. First to tap on their phone wins the round. Best of five!',
    coverEmoji: '⚡',
    coverGradient: 'from-amber-400 to-orange-600',
  },
  {
    id: 'word-sprint',
    title: 'Word Sprint',
    genre: 'word',
    playersMin: 2,
    playersMax: 8,
    hasSolo: true,
    controls: 'text',
    description:
      'A letter and a minimum length appear on screen. Type as many matching words as you can before the clock runs out. Longer words score more.',
    coverEmoji: '📝',
    coverGradient: 'from-sky-400 to-blue-600',
  },
  {
    id: 'draw-and-guess',
    title: 'Draw & Guess',
    genre: 'drawing',
    playersMin: 3,
    playersMax: 8,
    hasSolo: false,
    controls: 'draw',
    description:
      'One player draws the secret phrase on their phone — everyone watches it appear on the big screen. The rest type their guesses. Get it right to score!',
    coverEmoji: '🎨',
    coverGradient: 'from-fuchsia-400 to-purple-600',
  },
  {
    id: 'quiz-party',
    title: 'Quiz Party',
    genre: 'quiz',
    playersMin: 2,
    playersMax: 8,
    hasSolo: true,
    controls: 'triviaGrid',
    description:
      'General-knowledge questions with four options. Lock in your answer on your phone — the big screen shows how everyone voted once the timer ends.',
    coverEmoji: '🧠',
    coverGradient: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'karts',
    title: 'Karts',
    genre: 'racing',
    playersMin: 2,
    playersMax: 6,
    hasSolo: true,
    controls: 'stick',
    description:
      'Top-down kart racing on the big screen. Steer with the joystick on your phone, hold the boost pad on straights, drift the corners. Three laps!',
    coverEmoji: '🏁',
    coverGradient: 'from-rose-400 to-red-600',
  },
  {
    id: 'bomber-arena',
    title: 'Bomber Arena',
    genre: 'action',
    playersMin: 2,
    playersMax: 6,
    hasSolo: false,
    controls: 'dpad',
    description:
      'Classic maze mayhem. Drop bombs with the action button, blow up crates, and be the last player standing.',
    coverEmoji: '💣',
    coverGradient: 'from-orange-400 to-amber-700',
  },
  {
    id: 'simon-echo',
    title: 'Simon Echo',
    genre: 'party',
    playersMin: 2,
    playersMax: 8,
    hasSolo: false,
    controls: 'sequence',
    description:
      'Watch the sequence flash on the big screen, then repeat it on your phone pads. One mistake and you are out. Last one standing wins!',
    coverEmoji: '🔊',
    coverGradient: 'from-cyan-400 to-sky-600',
  },
]

export function gameById(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id)
}
