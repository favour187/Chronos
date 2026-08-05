import { useEffect, useState } from 'react'
import { useGame } from '../../store/game'
import { ERAS } from '../../eras/data'
import { sfx } from '../../audio/engine'

export function HUD() {
  const era = useGame((s) => s.currentEra)
  const eraIndex = useGame((s) => s.currentEraIndex)
  const collected = useGame((s) => s.collected)
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)
  const goToEra = useGame((s) => s.goToEra)
  const quality = useGame((s) => s.quality)
  const setQuality = useGame((s) => s.setQuality)
  const setPhase = useGame((s) => s.setPhase)
  const [showNarr, setShowNarr] = useState(true)

  useEffect(() => {
    setShowNarr(true)
    const t = window.setTimeout(() => setShowNarr(false), 7000)
    return () => window.clearTimeout(t)
  }, [era.id])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-logo">CHRONOS</div>
        <div className="hud-era-indicator">
          <div className="hud-era-dot" style={{ background: era.accent, boxShadow: `0 0 12px ${era.accent}` }} />
          <div>
            <div className="hud-era-name">{era.name}</div>
            <div className="hud-era-year">{era.year}</div>
          </div>
        </div>
        <div className="hud-controls">
          <button title="Toggle audio" onClick={() => { sfx.click(); toggleMute() }}>{muted ? '🔇' : '🔊'}</button>
          <button
            title="Graphics quality"
            onClick={() => {
              sfx.click()
              setQuality(quality === 'high' ? 'med' : quality === 'med' ? 'low' : 'high')
            }}
          >
            {quality === 'high' ? '◉' : quality === 'med' ? '◎' : '○'} {quality.toUpperCase()}
          </button>
          <button title="Fullscreen" onClick={toggleFullscreen}>⛶</button>
          <button
            title="Back to menu"
            onClick={() => {
              sfx.click()
              setPhase('menu')
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Left compass: current era glyph */}
      <div className="hud-compass">
        <div className="hud-compass-ring" style={{ borderColor: era.accent + '88' }}>
          <div className="hud-compass-glyph">{era.artifact.emoji}</div>
        </div>
        <div className="hud-compass-label">{era.subtitle}</div>
      </div>

      {/* Narrator tagline */}
      {showNarr && (
        <div className="hud-narration">
          <div className="hud-narr-line" />
          <div className="hud-narr-text">{era.narration}</div>
        </div>
      )}

      {/* Bottom timeline */}
      <div className="hud-bottom">
        <div className="hud-artifacts">
          <span className="hud-artifacts-label">ARTIFACTS</span>
          <span className="hud-artifacts-count" style={{ color: era.accent }}>
            {collected.size} / {ERAS.length}
          </span>
          <div className="hud-artifacts-row">
            {ERAS.map((e) => (
              <div
                key={e.id}
                className={`hud-artifact-dot ${collected.has(e.id) ? 'got' : ''}`}
                style={{ background: collected.has(e.id) ? e.accent : 'transparent', borderColor: e.accent }}
                title={`${e.name} — ${e.artifact.name}`}
                onClick={() => {
                  if (e.index <= eraIndex) {
                    sfx.click()
                    goToEra(e.index)
                  }
                }}
              />
            ))}
          </div>
        </div>
        <div className="hud-timeline">
          {ERAS.map((e) => {
            const pct = (e.index / (ERAS.length - 1)) * 100
            const isCurrent = e.index === eraIndex
            const isDone = collected.has(e.id)
            return (
              <div
                key={e.id}
                className={`hud-tl-node ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}`}
                style={{ left: `${pct}%`, color: e.accent, borderColor: e.accent }}
                onClick={() => {
                  if (e.index <= eraIndex) {
                    sfx.click()
                    goToEra(e.index)
                  }
                }}
              >
                <span className="hud-tl-emoji">{e.artifact.emoji}</span>
                <span className="hud-tl-tooltip" style={{ background: e.accent + '22', borderColor: e.accent }}>
                  <strong>{e.name}</strong>
                  <em>{e.year}</em>
                </span>
              </div>
            )
          })}
          <div
            className="hud-tl-progress"
            style={{
              width: `${(eraIndex / (ERAS.length - 1)) * 100}%`,
              background: `linear-gradient(90deg, ${ERAS[0].accent}, ${era.accent})`,
            }}
          />
        </div>
      </div>

      {/* Controls hint */}
      <div className="hud-hint">
        <kbd>WASD</kbd> move · <kbd>Drag</kbd> look · <kbd>Scroll</kbd> zoom · <kbd>Click</kbd> interact
      </div>
    </>
  )
}
