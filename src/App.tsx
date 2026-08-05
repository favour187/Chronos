import { useEffect } from 'react'
import { useGame } from './store/game'
import { Boot } from './scenes/Boot'
import { Menu } from './scenes/Menu'
import { Intro } from './scenes/Intro'
import { Tunnel } from './scenes/Tunnel'
import { Era } from './scenes/Era'
import { Finale } from './scenes/Finale'
import { Credits } from './scenes/Credits'
import { sfx } from './audio/engine'

export default function App() {
  const phase = useGame((s) => s.phase)
  const muted = useGame((s) => s.muted)

  useEffect(() => {
    sfx.setMuted(muted)
  }, [muted])

  useEffect(() => {
    // Keyboard shortcuts
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        useGame.getState().toggleMute()
      }
      if (e.code === 'Escape') {
        if (useGame.getState().phase === 'era') useGame.getState().setPhase('menu')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app-root">
      {phase === 'boot' && <Boot />}
      {phase === 'menu' && <Menu />}
      {phase === 'intro' && <Intro />}
      {phase === 'tunnel' && <Tunnel />}
      {phase === 'era' && <Era />}
      {phase === 'finale' && <Finale />}
      {phase === 'credits' && <Credits />}
      <div className="vignette" />
      <div className="scanlines" />
    </div>
  )
}
