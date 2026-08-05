import { useEffect, useState } from 'react'
import { useGame } from '../../store/game'
import { sfx } from '../../audio/engine'

export function InteractionPrompt() {
  const era = useGame((s) => s.currentEra)
  const collected = useGame((s) => s.collected.has(era.id))
  const openFact = useGame((s) => s.openFact)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    setVisible(true)
    const t = window.setTimeout(() => setVisible(false), 9000)
    return () => window.clearTimeout(t)
  }, [era.id])
  if (!visible || collected) return null
  return (
    <button
      className="interaction-prompt"
      style={{ borderColor: era.accent, color: era.accent, boxShadow: `0 0 20px ${era.accent}80` }}
      onClick={() => {
        sfx.click()
        openFact(era.id)
      }}
    >
      <span className="ip-kicker" style={{ background: era.accent }}>DISCOVER</span>
      <span className="ip-title">Era Briefing: {era.name}</span>
      <span className="ip-cta">Click for facts ▸</span>
    </button>
  )
}
