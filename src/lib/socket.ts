import { io, type Socket } from 'socket.io-client'
import type { ClientMessage, ServerMessage } from '../../shared/protocol'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({ transports: ['websocket', 'polling'] })
  }
  return socket
}

export function sendMsg(msg: ClientMessage): void {
  getSocket().emit('msg', msg)
}

type Handler = (msg: ServerMessage) => void

export function onMsg(handler: Handler): () => void {
  const s = getSocket()
  s.on('msg', handler)
  return () => s.off('msg', handler)
}

export interface SessionIdentity {
  code: string
  playerId: string
  role: 'screen' | 'phone'
}

export function loadIdentity(): SessionIdentity | null {
  try {
    const raw = localStorage.getItem('gleelounge:identity')
    return raw ? (JSON.parse(raw) as SessionIdentity) : null
  } catch {
    return null
  }
}

export function saveIdentity(id: SessionIdentity): void {
  localStorage.setItem('gleelounge:identity', JSON.stringify(id))
}

export function clearIdentity(): void {
  localStorage.removeItem('gleelounge:identity')
}
