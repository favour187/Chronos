// Mobile on-screen controls: virtual joystick (bottom-left)
// and a big "Next Era ▸" button (bottom-right).
import { useEffect, useRef, useState } from 'react'
import { useGame } from '../../store/game'
import { ERAS } from '../../eras/data'
import { sfx } from '../../audio/engine'

const isMobile =
  typeof window !== 'undefined' &&
  (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.matchMedia('(max-width: 900px)').matches)

export function MobileControls() {
  const eraIndex = useGame((s) => s.currentEraIndex)
  const nextEra = useGame((s) => s.nextEra)
  const allCollected = useGame((s) => s.collected.size)
  const era = ERAS[eraIndex]
  const stickRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const activeId = useRef<number | null>(null)

  useEffect(() => {
    if (!isMobile) return
    const base = baseRef.current
    if (!base) return
    const R = 40
    const start = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      activeId.current = t.identifier
      update(t)
    }
    const move = (e: TouchEvent) => {
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === activeId.current) {
          update(e.touches[i])
          e.preventDefault()
        }
      }
    }
    const end = () => {
      activeId.current = null
      setKnob({ x: 0, y: 0 })
      window.dispatchEvent(new CustomEvent('chronos-joy', { detail: { x: 0, y: 0 } }))
    }
    const update = (t: Touch) => {
      const rect = base.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      let dx = t.clientX - cx
      let dy = t.clientY - cy
      const d = Math.hypot(dx, dy)
      if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R }
      setKnob({ x: dx, y: dy })
      window.dispatchEvent(new CustomEvent('chronos-joy', { detail: { x: dx / R, y: -dy / R } }))
    }
    base.addEventListener('touchstart', start, { passive: false })
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('touchend', end)
    window.addEventListener('touchcancel', end)
    return () => {
      base.removeEventListener('touchstart', start)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', end)
      window.removeEventListener('touchcancel', end)
    }
  }, [])

  if (!isMobile) return null

  return (
    <>
      <div ref={baseRef} className="joy-base" aria-label="move joystick">
        <div
          ref={stickRef}
          className="joy-knob"
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>
      <button
        className="next-btn"
        onClick={() => {
          sfx.warp(1.2)
          sfx.whoosh(0.8)
          nextEra()
        }}
        style={{ ['--c' as string]: era?.accent ?? '#00d4ff' } as React.CSSProperties}
      >
        <span className="next-btn-eyebrow">
          {eraIndex < ERAS.length - 1 ? 'NEXT STOP' : 'FINALE'}
        </span>
        <span className="next-btn-title">
          {eraIndex < ERAS.length - 1 ? ERAS[eraIndex + 1].name : 'Time Core ▸'}
        </span>
        <span className="next-btn-meta">
          {allCollected}/{ERAS.length} artifacts
        </span>
        <span className="next-btn-arrow">▸</span>
      </button>
    </>
  )
}
