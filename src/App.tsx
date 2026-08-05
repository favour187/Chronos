import { useEffect, useRef, useState, useCallback } from 'react'
import { ERAS } from './data'
import { Starfield } from './components/Starfield'

type Phase = 'boot' | 'menu' | 'intro' | 'era' | 'finale' | 'credits'

export default function App() {
  const [phase, setPhase] = useState<Phase>('boot')
  const [loadPct, setLoadPct] = useState(0)
  const [eraIdx, setEraIdx] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const [muted, setMuted] = useState(false)

  // Preload images
  useEffect(() => {
    let p = 0
    const imgs = ERAS.map((e) => {
      const img = new Image()
      img.src = e.image
      return img
    })
    const id = window.setInterval(() => {
      p += 0.05 + Math.random() * 0.1
      if (p >= 1) {
        p = 1
        window.clearInterval(id)
        window.setTimeout(() => setPhase('menu'), 500)
      }
      setLoadPct(p)
      void imgs
    }, 60)
    return () => window.clearInterval(id)
  }, [])

  // Audio setup (single AudioContext, single master gain)
  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const c = new Ctx()
      const g = c.createGain()
      g.gain.value = 0.25
      g.connect(c.destination)
      audioCtxRef.current = c
      masterRef.current = g
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
  }, [])

  const tone = useCallback((f: number, d: number, t: OscillatorType = 'sine', v = 0.15, slide?: number) => {
    if (!audioCtxRef.current || !masterRef.current) return
    const c = audioCtxRef.current
    const o = c.createOscillator()
    const g = c.createGain()
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1800
    o.type = t
    o.frequency.setValueAtTime(f, c.currentTime)
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), c.currentTime + d)
    g.gain.setValueAtTime(0.0001, c.currentTime)
    g.gain.exponentialRampToValueAtTime(v, c.currentTime + 0.04)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d)
    o.connect(lp).connect(g).connect(masterRef.current)
    o.start()
    o.stop(c.currentTime + d + 0.05)
  }, [])

  const chime = useCallback(() => {
    tone(523.25, 1.8, 'sine', 0.07)
    setTimeout(() => tone(659.25, 2.0, 'sine', 0.05), 160)
    setTimeout(() => tone(783.99, 2.4, 'sine', 0.04), 320)
  }, [tone])

  const whoosh = useCallback(() => {
    if (!audioCtxRef.current || !masterRef.current) return
    const c = audioCtxRef.current
    const dur = 0.7
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length
      d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t)
    }
    const s = c.createBufferSource()
    s.buffer = buf
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 500
    const g = c.createGain()
    g.gain.value = 0.12
    s.connect(bp).connect(g).connect(masterRef.current)
    s.start()
  }, [])

  const warp = useCallback(() => {
    tone(100, 1.0, 'sine', 0.08, 500)
    whoosh()
  }, [tone, whoosh])

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.gain.setTargetAtTime(muted ? 0 : 0.25, audioCtxRef.current?.currentTime ?? 0, 0.2)
    }
  }, [muted])

  // Ambient hum — one detuned pair of oscillators, started once
  useEffect(() => {
    if (!audioCtxRef.current || !masterRef.current) return
    const c = audioCtxRef.current
    const freqs = [110, 164.81, 220]
    const oscs: OscillatorNode[] = []
    freqs.forEach((f) => {
      const o = c.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      const g = c.createGain()
      g.gain.value = 0.015
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 800
      o.connect(lp).connect(g).connect(masterRef.current!)
      o.start()
      oscs.push(o)
    })
    return () => oscs.forEach((o) => { try { o.stop() } catch { /* noop */ } })
  }, [phase === 'era' && eraIdx])

  // Auto-advance intro stages
  const [introStage, setIntroStage] = useState(0)
  useEffect(() => {
    if (phase !== 'intro') return
    const id = window.setTimeout(() => {
      if (introStage < 3) {
        setIntroStage(introStage + 1)
        if (introStage === 1) chime()
        if (introStage === 2) warp()
      } else {
        setPhase('era')
        setEraIdx(0)
      }
    }, [900, 1600, 1800, 1200][introStage])
    return () => window.clearTimeout(id)
  }, [phase, introStage, chime, warp])

  const next = useCallback(() => {
    ensureAudio()
    warp()
    setDir(1)
    if (eraIdx >= ERAS.length - 1) {
      setPhase('finale')
    } else {
      setEraIdx((i) => i + 1)
    }
  }, [eraIdx, ensureAudio, warp])

  const prev = useCallback(() => {
    ensureAudio()
    whoosh()
    setDir(-1)
    setEraIdx((i) => Math.max(0, i - 1))
  }, [ensureAudio, whoosh])

  const begin = useCallback(() => {
    ensureAudio()
    chime()
    whoosh()
    setPhase('intro')
    setIntroStage(0)
  }, [ensureAudio, chime, whoosh])

  // Touch swipe
  useEffect(() => {
    let sx = 0, sy = 0, t = 0
    const ts = (e: TouchEvent) => { if (e.touches.length !== 1) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; t = performance.now() }
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx
      const dy = e.changedTouches[0].clientY - sy
      const dt = performance.now() - t
      if (dt > 600 || Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 50) return
      if (dx < 0) { if (phase === 'menu') begin(); else if (phase === 'era') next(); else if (phase === 'finale') setPhase('credits'); }
      else { if (phase === 'era') prev() }
    }
    window.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchend', te, { passive: true })
    return () => { window.removeEventListener('touchstart', ts); window.removeEventListener('touchend', te) }
  }, [phase, next, prev, begin])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'Space') { e.preventDefault(); if (phase === 'menu') begin(); else if (phase === 'era') next(); else if (phase === 'finale') setPhase('credits'); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); if (phase === 'era') prev() }
      if (e.code === 'KeyM') setMuted((m) => !m)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, next, prev, begin])

  // Preload next/prev image for snappy transitions
  useEffect(() => {
    const nextImg = ERAS[Math.min(ERAS.length - 1, eraIdx + 1)]
    if (nextImg) { const i = new Image(); i.src = nextImg.image }
    const prevImg = ERAS[Math.max(0, eraIdx - 1)]
    if (prevImg) { const i = new Image(); i.src = prevImg.image }
  }, [eraIdx])

  // Finale auto-advance
  useEffect(() => {
    if (phase !== 'finale') return
    const id = window.setTimeout(() => setPhase('credits'), 6000)
    return () => window.clearTimeout(id)
  }, [phase])

  const era = ERAS[eraIdx]

  return (
    <div className="app" data-phase={phase}>
      <Starfield density={phase === 'boot' || phase === 'menu' ? 220 : 80} />

      {phase === 'boot' && (
        <div className="boot">
          <div className="boot-kicker">INITIATING TEMPORAL BRIDGE</div>
          <div className="boot-logo">CHRONOS</div>
          <div className="boot-bar"><div className="boot-fill" style={{ width: `${Math.round(loadPct * 100)}%` }} /></div>
          <div className="boot-pct">{Math.round(loadPct * 100)}%</div>
          <div className="boot-hint">The Living Timeline</div>
        </div>
      )}

      {phase === 'menu' && (
        <div className="menu">
          <div className="menu-hero">
            <div className="menu-line" />
            <div className="menu-eyebrow">A CINEMATIC JOURNEY</div>
            <h1 className="menu-title">CHRONOS</h1>
            <div className="menu-sub">The Living Timeline</div>
            <p className="menu-tag">
              13.8 billion years. 12 moments that made us.
              <br />One quiet journey through time.
            </p>
            <button className="btn-primary" onClick={begin}>▸  BEGIN</button>
            <div className="menu-controls">
              <span><kbd>←</kbd><kbd>→</kbd> navigate</span>
              <span><kbd>M</kbd> mute</span>
              <span><kbd>tap</kbd> on mobile</span>
            </div>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <div className="intro">
          <div className={`intro-stage s${introStage}`}>
            {introStage === 0 && <div className="intro-text">IN THE DARKNESS…</div>}
            {introStage === 1 && <div className="intro-text glow-gold">A clock forms from stardust.</div>}
            {introStage === 2 && <div className="intro-text glitch">TIME SHATTERS</div>}
            {introStage === 3 && <div className="intro-text glow-cyan">THE PORTAL OPENS</div>}
          </div>
        </div>
      )}

      {phase === 'era' && (
        <div className={`era dir-${dir === 1 ? 'next' : 'prev'}`} key={era.id}>
          <div
            className="era-img"
            style={{ backgroundImage: `url(${era.image})`, ['--accent' as string]: era.accent }}
          >
            <div className="era-grade" />
            <div className="era-gold" />
            <div className="era-vignette" />
          </div>

          <header className="hud-top">
            <div className="hud-logo">CHRONOS</div>
            <div className="hud-era">
              <span className="hud-dot" style={{ background: era.accent, boxShadow: `0 0 12px ${era.accent}` }} />
              <span className="hud-era-name">{era.name}</span>
            </div>
            <button className="hud-icon" onClick={() => setMuted((m) => !m)} aria-label="mute">{muted ? '🔇' : '🔊'}</button>
          </header>

          <div className="era-card">
            <div className="era-line" style={{ background: era.accent }} />
            <div className="era-year" style={{ color: era.accent }}>{era.year}</div>
            <h2 className="era-name">{era.name}</h2>
            <div className="era-sub">{era.subtitle}</div>
            <p className="era-tag">{era.tagline}</p>
            <p className="era-quote">“{era.quote}”</p>
          </div>

          <div className="hud-progress">
            {ERAS.map((e, i) => (
              <span key={e.id} className={`dot ${i === eraIdx ? 'current' : ''} ${i < eraIdx ? 'done' : ''}`} style={{ ['--c' as string]: e.accent, background: i <= eraIdx ? e.accent : 'transparent', borderColor: e.accent }} />
            ))}
          </div>

          <div className="nav">
            {eraIdx > 0 && (
              <button className="nav-btn prev" onClick={prev} aria-label="previous">
                <span className="nav-arrow">◂</span>
                <span className="nav-label">{ERAS[eraIdx - 1].name}</span>
              </button>
            )}
            <button className="nav-btn next" onClick={next} aria-label="next">
              <span className="nav-label">
                {eraIdx < ERAS.length - 1 ? ERAS[eraIdx + 1].name : 'THE FINALE'}
              </span>
              <span className="nav-arrow">▸</span>
            </button>
          </div>

          <div className="swipe-hint">← swipe or tap →</div>
        </div>
      )}

      {phase === 'finale' && (
        <div className="finale">
          <div className="finale-img" style={{ backgroundImage: 'url(/images/finale-collapse.jpg)' }}>
            <div className="finale-grade" />
          </div>
          <div className="finale-text">
            <div className="finale-kicker">TIMELINE RESTORED</div>
            <h1 className="finale-title">All moments<br />become one.</h1>
            <div className="finale-bar"><div className="finale-fill" /></div>
          </div>
        </div>
      )}

      {phase === 'credits' && (
        <div className="credits">
          <div className="credits-img" style={{ backgroundImage: 'url(/images/credits-galaxy.jpg)' }}>
            <div className="credits-grade" />
          </div>
          <div className="credits-text">
            <div className="credits-line" />
            <p className="credits-quote">“The future is created by those<br />who understand the past.”</p>
            <div className="credits-thanks">Thank you for traveling through time.</div>
            <button className="btn-primary" onClick={() => { setPhase('menu'); setEraIdx(0) }}>↻ JOURNEY AGAIN</button>
            <div className="credits-fine">CHRONOS · The Living Timeline</div>
          </div>
        </div>
      )}

      <div className="grain" />
      <div className="letterbox-top" />
      <div className="letterbox-bottom" />
    </div>
  )
}
