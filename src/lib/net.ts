import { useEffect, useState } from 'react'
import type { RoomState, ServerMessage } from '../../shared/protocol'
import { onMsg, sendMsg } from './socket'

export function useLatestMsg<T extends ServerMessage['t']>(
  type: T,
): Extract<ServerMessage, { t: T }> | null {
  const [msg, setMsg] = useState<Extract<ServerMessage, { t: T }> | null>(null)
  useEffect(() => {
    return onMsg((m) => {
      if (m.t === type) setMsg(m as Extract<ServerMessage, { t: T }>)
    })
  }, [type])
  return msg
}

export function useRoomState(): RoomState | null {
  const [state, setState] = useState<RoomState | null>(null)
  useEffect(() => {
    return onMsg((m) => {
      if (m.t === 'room:state' || m.t === 'room:created' || m.t === 'screen:hello:ok') {
        setState(m.room)
      }
    })
  }, [])
  return state
}

export { sendMsg }
