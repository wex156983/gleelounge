// In-memory room registry. Rooms die with the process (by design — see architecture.md).
import { randomUUID, randomInt } from 'node:crypto'
import type { PublicPlayer, RoomState, RoomStatus, ServerMessage } from '../shared/protocol'
import { gameById } from '../shared/games'
import type { Socket, Server } from 'socket.io'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // no I/O to avoid confusion
const MAX_PLAYERS = 16
const ROOM_IDLE_MS = 15 * 60 * 1000
const INPUT_RATE_WINDOW_MS = 1000
const INPUT_RATE_MAX = 60

interface Player {
  id: string
  name: string
  avatarId: string
  colorIdx: number
  isHost: boolean
  ready: boolean
  connected: boolean
  socketId: string | null
}

interface Room {
  code: string
  players: Map<string, Player>
  hostId: string
  screenSocketId: string | null
  status: RoomStatus
  currentGameId: string | null
  currentSeed: number | null
  currentPlayers: PublicPlayer[]
  lastPatch: unknown | null
  createdAt: number
  lastActivity: number
  inputCount: Map<string, { windowStart: number; count: number }>
}

const rooms = new Map<string, Room>()
const bySocket = new Map<
  string,
  { code: string; playerId: string | null; role: 'screen' | 'phone' }
>()

function genCode(): string {
  for (;;) {
    let code = ''
    for (let i = 0; i < 4; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
    if (!rooms.has(code)) return code
  }
}

function toPublic(p: Player): PublicPlayer {
  return {
    id: p.id,
    name: p.name,
    avatarId: p.avatarId,
    colorIdx: p.colorIdx,
    isHost: p.isHost,
    ready: p.ready,
    connected: p.connected,
  }
}

function roomState(room: Room): RoomState {
  return {
    code: room.code,
    status: room.status,
    players: [...room.players.values()].map(toPublic),
    hostId: room.hostId,
    currentGameId: room.currentGameId,
  }
}

function send(socket: Socket | null, msg: ServerMessage): void {
  socket?.emit('msg', msg)
}

function broadcastRoom(io: Server, room: Room, msg: ServerMessage): void {
  io.to(room.code).emit('msg', msg)
}

function screenSocket(room: Room): Socket | null {
  return room.screenSocketId ? (ioOf().sockets.sockets.get(room.screenSocketId) ?? null) : null
}

// set at init to avoid circular imports
let ioRef: import('socket.io').Server | null = null
function ioOf(): import('socket.io').Server {
  if (!ioRef) throw new Error('io not initialised')
  return ioRef
}

export function initRooms(io: import('socket.io').Server): void {
  ioRef = io
}

export function createRoom(
  socket: Socket,
  _name: string,
  _avatarId: string,
): { code: string; playerId: string } | { error: string } {
  const code = genCode()
  const room: Room = {
    code,
    players: new Map(),
    hostId: socket.id,
    screenSocketId: socket.id,
    status: 'lobby',
    currentGameId: null,
    currentSeed: null,
    currentPlayers: [],
    lastPatch: null,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    inputCount: new Map(),
  }
  rooms.set(code, room)
  bySocket.set(socket.id, { code, playerId: null, role: 'screen' })
  void socket.join(code)
  return { code, playerId: '' }
}

export function joinRoom(
  socket: Socket,
  code: string,
  name: string,
  avatarId: string,
  resumePlayerId?: string,
):
  | { ok: true; playerId: string; resumedMidGame?: { gameId: string; seed: number; players: PublicPlayer[]; patch: unknown | null } }
  | { ok: false; reason: string } {
  const room = rooms.get(code.trim().toUpperCase())
  if (!room) return { ok: false, reason: 'Room not found' }

  // resume: same player id reconnecting (allowed mid-game and in results)
  if (resumePlayerId) {
    const existing = room.players.get(resumePlayerId)
    if (existing) {
      existing.connected = true
      existing.socketId = socket.id
      bySocket.set(socket.id, { code: room.code, playerId: existing.id, role: 'phone' })
      void socket.join(room.code)
      room.lastActivity = Date.now()
      broadcastRoom(ioOf(), room, { t: 'room:state', room: roomState(room) })
      const midGame =
        room.status === 'in_game' && room.currentGameId
          ? {
              gameId: room.currentGameId,
              seed: room.currentSeed ?? 0,
              players: room.currentPlayers,
              patch: room.lastPatch,
            }
          : undefined
      return { ok: true, playerId: existing.id, resumedMidGame: midGame }
    }
  }

  // new players can only join before the game starts
  if (room.status === 'in_game') return { ok: false, reason: 'Game already started' }
  if (room.players.size >= MAX_PLAYERS) return { ok: false, reason: 'Room is full' }

  const playerId = randomUUID()
  const usedColors = new Set([...room.players.values()].map((p) => p.colorIdx))
  let colorIdx = 0
  while (usedColors.has(colorIdx) && colorIdx < 8) colorIdx++
  const uniqueName = dedupeName(room, sanitizeName(name))
  const player: Player = {
    id: playerId,
    name: uniqueName,
    avatarId,
    colorIdx: colorIdx % 8,
    isHost: false,
    ready: false,
    connected: true,
    socketId: socket.id,
  }
  room.players.set(playerId, player)
  bySocket.set(socket.id, { code: room.code, playerId, role: 'phone' })
  void socket.join(room.code)
  room.lastActivity = Date.now()
  broadcastRoom(ioOf(), room, { t: 'player:joined', player: toPublic(player) })
  broadcastRoom(ioOf(), room, { t: 'room:state', room: roomState(room) })
  return { ok: true, playerId }
}

export function screenHello(
  socket: Socket,
  code: string,
): { ok: true } | { ok: false; reason: string } {
  const room = rooms.get(code.trim().toUpperCase())
  if (!room) return { ok: false, reason: 'Room not found' }
  room.screenSocketId = socket.id
  room.hostId = socket.id
  bySocket.set(socket.id, { code: room.code, playerId: null, role: 'screen' })
  void socket.join(room.code)
  return { ok: true }
}

export function leaveRoom(socket: Socket): void {
  const meta = bySocket.get(socket.id)
  if (!meta) return
  bySocket.delete(socket.id)
  const room = rooms.get(meta.code)
  if (!room) return
  room.lastActivity = Date.now()

  if (meta.role === 'screen') {
    room.screenSocketId = null
    return
  }
  if (!meta.playerId) return
  const player = room.players.get(meta.playerId)
  if (!player) return
  player.connected = false
  player.socketId = null
  broadcastRoom(ioOf(), room, { t: 'player:left', playerId: player.id })

  // host migration: first still-connected player
  if (room.hostId === player.id) {
    player.isHost = false
    const next = [...room.players.values()].find((p) => p.connected)
    if (next) {
      next.isHost = true
      room.hostId = next.id
    }
  }
  broadcastRoom(ioOf(), room, { t: 'room:state', room: roomState(room) })
}

export function setReady(socket: Socket, ready: boolean): void {
  const ctx = roomOf(socket)
  if (!ctx) return
  const player = ctx.room.players.get(ctx.playerId ?? '')
  if (!player) return
  player.ready = ready
  ctx.room.lastActivity = Date.now()
  broadcastRoom(ioOf(), ctx.room, { t: 'room:state', room: roomState(ctx.room) })
}

export function emoji(socket: Socket, emojiChar: string): void {
  const ctx = roomOf(socket)
  if (!ctx || !ctx.playerId) return
  broadcastRoom(ioOf(), ctx.room, { t: 'player:emoji', playerId: ctx.playerId, emoji: emojiChar })
}

export function startGame(socket: Socket, gameId: string): { ok: true } | { ok: false; reason: string } {
  const ctx = roomOf(socket)
  if (!ctx) return { ok: false, reason: 'Not in a room' }
  const { room } = ctx
  if (ctx.role !== 'screen') return { ok: false, reason: 'Only the host can start' }
  if (room.status === 'in_game') return { ok: false, reason: 'Already in a game' }
  const game = gameById(gameId)
  if (!game) return { ok: false, reason: 'Unknown game' }
  const connected = [...room.players.values()].filter((p) => p.connected)
  if (connected.length < game.playersMin)
    return { ok: false, reason: `${game.title} needs at least ${game.playersMin} players` }
  if (connected.length > game.playersMax)
    return { ok: false, reason: `${game.title} supports up to ${game.playersMax} players` }
  room.status = 'in_game'
  room.currentGameId = gameId
  room.lastActivity = Date.now()
  const players = connected.map(toPublic)
  room.currentSeed = randomInt(1, 2 ** 31)
  room.currentPlayers = players
  room.lastPatch = null
  broadcastRoom(ioOf(), room, {
    t: 'game:started',
    gameId,
    seed: room.currentSeed,
    players,
  })
  broadcastRoom(ioOf(), room, { t: 'room:state', room: roomState(room) })
  return { ok: true }
}

export function relayInput(socket: Socket, type: string, payload: unknown): void {
  const ctx = roomOf(socket)
  if (!ctx || !ctx.playerId) return
  const { room, playerId } = ctx
  if (room.status !== 'in_game') return

  // token-bucket rate limit per player
  const now = Date.now()
  let bucket = room.inputCount.get(playerId)
  if (!bucket || now - bucket.windowStart > INPUT_RATE_WINDOW_MS) {
    bucket = { windowStart: now, count: 0 }
    room.inputCount.set(playerId, bucket)
  }
  bucket.count++
  if (bucket.count > INPUT_RATE_MAX) return

  send(screenSocket(room), { t: 'input', playerId, type, payload })
}

export function relayState(socket: Socket, patch: unknown): void {
  const ctx = roomOf(socket)
  if (!ctx) return
  // only the screen may broadcast authoritative state
  if (ctx.role !== 'screen') return
  ctx.room.lastPatch = patch
  broadcastRoom(ioOf(), ctx.room, { t: 'game:state', patch })
}

export function endGame(socket: Socket, results: unknown): void {
  const ctx = roomOf(socket)
  if (!ctx || ctx.role !== 'screen') return
  const room = ctx.room
  room.status = 'results'
  room.lastActivity = Date.now()
  broadcastRoom(ioOf(), room, { t: 'game:ended', results: results as import('../shared/protocol').MatchResults })
}

export function backToLobby(socket: Socket): void {
  const ctx = roomOf(socket)
  if (!ctx || ctx.role !== 'screen') return
  const room = ctx.room
  room.status = 'lobby'
  room.currentGameId = null
  for (const p of room.players.values()) p.ready = false
  room.lastActivity = Date.now()
  broadcastRoom(ioOf(), room, { t: 'room:state', room: roomState(room) })
}

function roomOf(socket: Socket): { room: Room; playerId: string | null; role: 'screen' | 'phone' } | null {
  const meta = bySocket.get(socket.id)
  if (!meta) return null
  const room = rooms.get(meta.code)
  if (!room) return null
  return { room, playerId: meta.playerId, role: meta.role }
}

export function sanitizeName(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 12)
  return cleaned || 'Player'
}

function dedupeName(room: Room, name: string): string {
  const names = new Set([...room.players.values()].map((p) => p.name.toLowerCase()))
  if (!names.has(name.toLowerCase())) return name
  for (let i = 2; i < 100; i++) {
    const candidate = `${name.slice(0, 10)}${i}`
    if (!names.has(candidate.toLowerCase())) return candidate
  }
  return `${name.slice(0, 8)}${randomInt(100, 999)}`
}

export function sweepRooms(): number {
  const now = Date.now()
  let removed = 0
  for (const [code, room] of rooms) {
    const anyConnected = [...room.players.values()].some((p) => p.connected) || room.screenSocketId
    if (!anyConnected && now - room.lastActivity > ROOM_IDLE_MS) {
      rooms.delete(code)
      removed++
    }
  }
  return removed
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.trim().toUpperCase())
}

export function codeOfSocket(socketId: string): string | null {
  return bySocket.get(socketId)?.code ?? null
}

export function stateOf(room: Room): RoomState {
  return roomState(room)
}
