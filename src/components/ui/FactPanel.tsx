import { useGame } from '../../store/game'

export function FactPanel() {
  const era = useGame((s) => s.currentEra)
  const open = useGame((s) => s.factOpen)
  const close = useGame((s) => s.openFact)
  if (!open) return null
  return (
    <div className="fact-overlay" onClick={() => close(null)}>
      <div className="fact-panel" onClick={(e) => e.stopPropagation()} style={{ borderColor: era.accent, boxShadow: `0 0 40px ${era.accent}40` }}>
        <div className="fact-head">
          <span className="fact-era" style={{ color: era.accent }}>{era.name}</span>
          <button className="fact-close" onClick={() => close(null)}>✕</button>
        </div>
        <h2 className="fact-title" style={{ color: era.accent }}>Did you know?</h2>
        <ul className="fact-list">
          {era.facts.map((f, i) => (
            <li key={i}>
              <span className="fact-label" style={{ color: era.accent }}>{f.label}</span>
              <span className="fact-detail">{f.detail}</span>
            </li>
          ))}
        </ul>
        <div className="fact-artifact">
          <span className="fact-artifact-emoji">{era.artifact.emoji}</span>
          <div>
            <div className="fact-artifact-name">{era.artifact.name}</div>
            <div className="fact-artifact-note">Collect the glowing artifact near the center to secure this era.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
