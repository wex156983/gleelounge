import express from 'express'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { Server, type Socket } from 'socket.io'
import type { ClientMessage, MatchResults } from '../shared/protocol'
import { GAMES } from '../shared/games'
import { seedGames, saveMatch, recentMatches } from './db'
import {
  initRooms,
  createRoom,
  joinRoom,
  screenHello,
  leaveRoom,
  setReady,
  emoji,
  startGame,
  relayInput,
  relayState,
  endGame,
  backToLobby,
  sweepRooms,
  getRoom,
  stateOf,
  codeOfSocket,
} from './rooms'

const PORT = Number(process.env.PORT ?? 3001)
const here = dirname(fileURLToPath(import.meta.url))

seedGames(GAMES)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: true },
  maxHttpBufferSize: 1e5, // 100 KB — draw batches stay under this
})

initRooms(io)

app.get('/api/games', (_req, res) => {
  res.json(GAMES)
})

app.get('/api/matches/recent', (_req, res) => {
  res.json(recentMatches(10))
})

// production: serve the Vite build
if (process.env.NODE_ENV === 'production') {
  const dist = join(here, '..', 'dist')
  app.use(express.static(dist))
  app.get(/^\/(?!socket\.io|api).*/, (_req, res) => {
    res.sendFile(join(dist, 'index.html'))
  })
}

const matchStarts = new Map<string, number>()

io.on('connection', (socket: Socket) => {
  socket.on('msg', (raw: ClientMessage) => {
    try {
      handle(socket, raw)
    } catch (err) {
      console.error('handler error', err)
      socket.emit('msg', { t: 'error', reason: 'Server error' })
    }
  })
  socket.on('disconnect', () => {
    leaveRoom(socket)
  })
})

function handle(socket: Socket, msg: ClientMessage): void {
  switch (msg.t) {
    case 'room:create': {
      const result = createRoom(socket, msg.name, msg.avatarId)
      if ('error' in result) {
        socket.emit('msg', { t: 'room:error', reason: result.error })
        return
      }
      const room = getRoom(result.code)
      if (!room) return
      matchStarts.set(result.code, Date.now())
      socket.emit('msg', {
        t: 'room:created',
        code: result.code,
        playerId: result.playerId,
        room: stateOf(room),
      })
      return
    }
    case 'room:join': {
      const result = joinRoom(socket, msg.code, msg.name, msg.avatarId, msg.playerId)
      if (!result.ok) {
        socket.emit('msg', { t: 'room:error', reason: result.reason })
        return
      }
      const room = getRoom(msg.code)
      if (!room) return
      socket.emit('msg', {
        t: 'room:state',
        room: stateOf(room),
      })
      // tell the joiner their id via a state-like event: reuse room:created shape for phones too
      socket.emit('msg', {
        t: 'room:created',
        code: room.code,
        playerId: result.playerId,
        room: stateOf(room),
      })
      // resume mid-game: replay the game start + latest state to this phone only
      if (result.resumedMidGame) {
        const g = result.resumedMidGame
        socket.emit('msg', { t: 'game:started', gameId: g.gameId, seed: g.seed, players: g.players })
        if (g.patch != null) socket.emit('msg', { t: 'game:state', patch: g.patch })
      }
      return
    }
    case 'screen:hello': {
      const result = screenHello(socket, msg.code)
      if (!result.ok) {
        socket.emit('msg', { t: 'room:error', reason: result.reason })
        return
      }
      const room = getRoom(msg.code)
      if (!room) return
      socket.emit('msg', { t: 'screen:hello:ok', room: stateOf(room) })
      return
    }
    case 'room:leave':
      leaveRoom(socket)
      return
    case 'player:ready':
      setReady(socket, msg.ready)
      return
    case 'player:emoji':
      emoji(socket, msg.emoji)
      return
    case 'game:start': {
      const result = startGame(socket, msg.gameId)
      if (!result.ok) socket.emit('msg', { t: 'error', reason: result.reason })
      return
    }
    case 'game:input':
      relayInput(socket, msg.type, msg.payload)
      return
    case 'game:state':
      relayState(socket, msg.patch)
      return
    case 'game:end': {
      const results = msg.results as MatchResults
      const code = codeOfSocket(socket.id) ?? '????'
      const started = matchStarts.get(code) ?? Date.now()
      const ended = Date.now()
      saveMatch(
        randomUUID(),
        code,
        results.gameId,
        new Date(started).toISOString(),
        new Date(ended).toISOString(),
        Math.round((ended - started) / 1000),
        results,
      )
      matchStarts.delete(code)
      endGame(socket, results)
      return
    }
    case 'game:lobby':
      backToLobby(socket)
      return
    default:
      socket.emit('msg', { t: 'error', reason: 'Unknown message' })
  }
}

setInterval(() => {
  const n = sweepRooms()
  if (n > 0) console.log(`swept ${n} idle rooms`)
}, 60_000)

httpServer.listen(PORT, () => {
  console.log(`GleeLounge server on :${PORT}`)
})
