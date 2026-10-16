import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Landing } from './screens/Landing'
import { Console } from './screens/Console'
import { Join } from './screens/Join'
import { Privacy, Terms } from './screens/Legal'
import { getSocket } from './lib/socket'

export function App() {
  useEffect(() => {
    const s = getSocket()
    function down() {
      window.dispatchEvent(new Event('cp:disconnected'))
    }
    function up() {
      window.dispatchEvent(new Event('cp:reconnected'))
    }
    s.on('disconnect', down)
    s.on('connect', up)
    return () => {
      s.off('disconnect', down)
      s.off('connect', up)
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/console" element={<Console />} />
        <Route path="/join" element={<Join />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  )
}
