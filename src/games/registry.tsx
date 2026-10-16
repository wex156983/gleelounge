import type { GameMeta } from '../../shared/protocol'
import { GAMES } from '../../shared/games'
import type { GameCtrlProps, GameScreenProps } from './runtime'
import { ReactionDuel } from './reaction-duel'
import { WordSprint } from './word-sprint'
import { DrawAndGuess } from './draw-and-guess'
import { QuizParty } from './quiz-party'
import { Karts } from './karts'
import { BomberArena } from './bomber-arena'
import { SimonEcho } from './simon-echo'

export interface GameModule {
  meta: GameMeta
  Screen: (props: GameScreenProps) => JSX.Element
  Controller: (props: GameCtrlProps) => JSX.Element
}

const MODULES: Record<string, Omit<GameModule, 'meta'>> = {
  'reaction-duel': { Screen: ReactionDuel.Screen, Controller: ReactionDuel.Controller },
  'word-sprint': { Screen: WordSprint.Screen, Controller: WordSprint.Controller },
  'draw-and-guess': { Screen: DrawAndGuess.Screen, Controller: DrawAndGuess.Controller },
  'quiz-party': { Screen: QuizParty.Screen, Controller: QuizParty.Controller },
  karts: { Screen: Karts.Screen, Controller: Karts.Controller },
  'bomber-arena': { Screen: BomberArena.Screen, Controller: BomberArena.Controller },
  'simon-echo': { Screen: SimonEcho.Screen, Controller: SimonEcho.Controller },
}

export const REGISTRY: GameModule[] = GAMES.map((meta) => {
  const mod = MODULES[meta.id]
  return { meta, Screen: mod.Screen, Controller: mod.Controller }
})

export function getGame(id: string): GameModule | undefined {
  return REGISTRY.find((g) => g.meta.id === id)
}
