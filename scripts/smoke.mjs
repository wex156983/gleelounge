// Quick WS smoke test: create room, join, start game, send input, end match.
import { io } from 'socket.io-client'

const screen = io('http://localhost:3001', { transports: ['websocket'] })
const phone = io('http://localhost:3001', { transports: ['websocket'] })

let code = null
let fail = null

function timeout(ms, label) {
  return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout: ' + label)), ms))
}

screen.on('msg', (m) => {
  console.log('SCREEN <-', m.t, m.code ?? m.reason ?? m.results?.gameId ?? '')
  if (m.t === 'room:created') {
    code = m.code
    phone.emit('msg', { t: 'room:join', code, name: 'Tester', avatarId: '🐸' })
  }
  if (m.t === 'game:started') {
    // simulate a tap input from screen side is not possible; phone sends input
    phone.emit('msg', { t: 'game:input', type: 'tap', payload: Date.now() })
    setTimeout(() => {
      screen.emit('msg', {
        t: 'game:end',
        results: {
          gameId: 'reaction-duel',
          entries: [
            { playerId: 'p1', name: 'A', avatarId: '🦊', colorIdx: 0, value: 3, rank: 1 },
            { playerId: 'p2', name: 'B', avatarId: '🐸', colorIdx: 1, value: 2, rank: 2 },
          ],
        },
      })
    }, 300)
  }
  if (m.t === 'game:ended') {
    console.log('SMOKE OK')
    process.exit(0)
  }
})

phone.on('msg', (m) => {
  console.log('PHONE <-', m.t, m.playerId ? '(id ok)' : m.reason ?? '')
})

async function main() {
  await Promise.race([
    new Promise((res) => screen.on('connect', res)),
    timeout(3000, 'screen connect'),
  ])
  screen.emit('msg', { t: 'room:create', name: 'Host', avatarId: '🦊' })
  setTimeout(() => {
    if (!code) { console.error('no room code'); process.exit(1) }
    screen.emit('msg', { t: 'game:start', gameId: 'reaction-duel' })
  }, 500)
  setTimeout(() => { console.error('FAIL: overall timeout'); process.exit(1) }, 8000)
}

main().catch((e) => { console.error(e); process.exit(1) })
