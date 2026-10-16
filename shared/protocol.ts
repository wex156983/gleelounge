// Shared between server and clients — the WebSocket protocol + game catalog types.

export type Genre =
  | 'party'
  | 'quiz'
  | 'word'
  | 'drawing'
  | 'racing'
  | 'action'
  | 'sports'
  | 'board'
  | 'puzzle'

export type ControlsType =
  | 'stick'
  | 'dpad'
  | 'text'
  | 'draw'
  | 'tapGrid'
  | 'reaction'
  | 'sequence'
  | 'triviaGrid'
  | 'none'

export interface GameMeta {
  id: string
  title: string
  genre: Genre
  playersMin: number
  playersMax: number
  hasSolo: boolean
  controls: ControlsType
  description: string
  coverEmoji: string
  coverGradient: string
}

export type RoomStatus = 'lobby' | 'in_game' | 'results'

export interface PublicPlayer {
  id: string
  name: string
  avatarId: string
  colorIdx: number
  isHost: boolean
  ready: boolean
  connected: boolean
}

export interface RoomState {
  code: string
  status: RoomStatus
  players: PublicPlayer[]
  hostId: string
  currentGameId: string | null
}

export interface MatchResultEntry {
  playerId: string
  name: string
  avatarId: string
  colorIdx: number
  value: number
  rank: number
  meta?: Record<string, unknown>
}

export interface MatchResults {
  gameId: string
  entries: MatchResultEntry[]
}

// ---- client → server ----

export type ClientMessage =
  | { t: 'room:create'; name: string; avatarId: string }
  | { t: 'room:join'; code: string; name: string; avatarId: string; playerId?: string }
  | { t: 'room:leave' }
  | { t: 'screen:hello'; code: string }
  | { t: 'player:ready'; ready: boolean }
  | { t: 'player:emoji'; emoji: string }
  | { t: 'game:start'; gameId: string }
  | { t: 'game:input'; type: string; payload: unknown }
  | { t: 'game:state'; patch: unknown }
  | { t: 'game:end'; results: MatchResults }
  | { t: 'game:lobby' }

// ---- server → client ----

export type ServerMessage =
  | { t: 'room:created'; code: string; playerId: string; room: RoomState }
  | { t: 'room:state'; room: RoomState }
  | { t: 'room:error'; reason: string }
  | { t: 'player:joined'; player: PublicPlayer }
  | { t: 'player:left'; playerId: string }
  | { t: 'player:emoji'; playerId: string; emoji: string }
  | { t: 'game:started'; gameId: string; seed: number; players: PublicPlayer[] }
  | { t: 'input'; playerId: string; type: string; payload: unknown }
  | { t: 'game:state'; patch: unknown }
  | { t: 'game:ended'; results: MatchResults }
  | { t: 'screen:hello:ok'; room: RoomState }
  | { t: 'error'; reason: string }

export const AVATARS = [
  '🦊',
  '🐼',
  '🐸',
  '🐵',
  '🦁',
  '🐙',
  '🦄',
  '🐨',
  '🐯',
  '🐮',
  '🐷',
  '🐰',
  '🐻',
  '🦉',
  '🐳',
  '🦖',
] as const

export const EMOJIS = ['👍', '😂', '😮', '😢', '😡', '🎉'] as const
