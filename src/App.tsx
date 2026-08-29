import { useEffect, useRef, useState, useCallback } from 'react'
import { ERAS } from './data'
import { Starfield } from './components/Starfield'
import { Safe3D } from './components/Safe3D'
import { ImmersiveLayer } from './three/ImmersiveLayer'

type Phase = 'boot' | 'menu' | 'intro' | 'era' | 'finale' | 'credits'

export default function App() {
  const [phase, setPhase] = useState<Phase>('boot')
  const [loadPct, setLoadPct] = useState(0)
  const [eraIdx, setEraIdx] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const padRef = useRef<{ oscs: OscillatorNode[]; lp: BiquadFilterNode } | null>(null)
  const [muted, setMuted] = useState(false)





  useEffect(() => {
    const critical = [
      '/images/boot-stars.jpg',
      '/images/menu-clock.jpg',
      ERAS[0].image,
    ]
    const later = [
      ...ERAS.slice(1).map((e) => e.image),
      '/images/finale-collapse.jpg',
      '/images/credits-galaxy.jpg',
    ]
    let done = 0
    let canceled = false
    const finishOne = () => {
      done += 1
      if (canceled) return
      setLoadPct(done / critical.length)
      if (done >= critical.length) {
        window.setTimeout(() => !canceled && setPhase('menu'), 400)
      }
    }
    const imgs = critical.map((src) => {
      const img = new Image()
      img.onload = finishOne
      img.onerror = finishOne
      img.src = src
      return img
    })

    const warm = later.map((src) => { const img = new Image(); img.src = src; return img })
    return () => {
      canceled = true
      imgs.forEach((i) => { i.onload = null; i.onerror = null })
      warm.forEach((i) => { i.onload = null; i.onerror = null })
    }
  }, [])


  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const c = new Ctx()
      const g = c.createGain()
      g.gain.value = 0.25
      g.connect(c.destination)
      audioCtxRef.current = c
      masterRef.current = g



      const freqs = [110, 164.81, 220]
      const oscs: OscillatorNode[] = []
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 700
      lp.connect(g)
      freqs.forEach((f) => {
        const o = c.createOscillator()
        o.type = 'sine'
        o.frequency.value = f
        const og = c.createGain()
        og.gain.value = 0.012
        o.connect(og).connect(lp)
        o.start()
        oscs.push(o)
      })
      padRef.current = { oscs, lp }
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
  }, [])

  useEffect(() => {
    if (masterRef.current && audioCtxRef.current) {
      masterRef.current.gain.setTargetAtTime(muted ? 0 : 0.25, audioCtxRef.current.currentTime, 0.2)
    }
  }, [muted])


  useEffect(() => {
    const p = padRef.current
    if (!p || !audioCtxRef.current) return
    const target = phase === 'era' ? 1100 : phase === 'intro' || phase === 'finale' ? 1400 : 600
    p.lp.frequency.setTargetAtTime(target, audioCtxRef.current.currentTime, 0.8)
  }, [phase])

  const tone = useCallback((f: number, d: number, t: OscillatorType = 'sine', v = 0.15, slide?: number) => {
    if (!audioCtxRef.current || !masterRef.current) return
    const c = audioCtxRef.current
    const o = c.createOscillator()
    const g = c.createGain()
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1600
    o.type = t
    o.frequency.setValueAtTime(f, c.currentTime)
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), c.currentTime + d)
    g.gain.setValueAtTime(0.0001, c.currentTime)
    g.gain.exponentialRampToValueAtTime(v, c.currentTime + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d)
    o.connect(lp).connect(g).connect(masterRef.current)
    o.start()
    o.stop(c.currentTime + d + 0.05)
  }, [])

  const chime = useCallback(() => {
    tone(523.25, 2.2, 'sine', 0.06)
    setTimeout(() => tone(659.25, 2.3, 'sine', 0.045), 170)
    setTimeout(() => tone(783.99, 2.6, 'sine', 0.035), 340)
  }, [tone])

  const whoosh = useCallback(() => {
    if (!audioCtxRef.current || !masterRef.current) return
    const c = audioCtxRef.current
    const dur = 0.65
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length
      d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t) * (1 - t * 0.5)
    }
    const s = c.createBufferSource()
    s.buffer = buf
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 480
    bp.Q.value = 0.9
    const g = c.createGain()
    g.gain.value = 0.09
    s.connect(bp).connect(g).connect(masterRef.current)
    s.start()
  }, [])

  const warp = useCallback(() => {
    tone(90, 0.9, 'sine', 0.07, 460)
    whoosh()
  }, [tone, whoosh])


  const [introStage, setIntroStage] = useState(0)
  useEffect(() => {
    if (phase !== 'intro') return
    const delay = [800, 1500, 1500, 1100][introStage]
    const id = window.setTimeout(() => {
      if (introStage < 3) {
        setIntroStage(introStage + 1)
        if (introStage === 1) chime()
        if (introStage === 2) warp()
      } else {
        setPhase('era')
        setEraIdx(0)
      }
    }, delay)
    return () => window.clearTimeout(id)
  }, [phase, introStage, chime, warp])


  useEffect(() => {
    if (phase !== 'intro') setIntroStage(0)
  }, [phase])

  const next = useCallback(() => {
    ensureAudio()
    warp()
    setDir(1)
    if (phase === 'menu') { setPhase('intro'); return }
    if (phase === 'credits') { setPhase('menu'); setEraIdx(0); return }
    if (eraIdx >= ERAS.length - 1) { setPhase('finale'); return }
    setEraIdx((i) => i + 1)
  }, [phase, eraIdx, ensureAudio, warp])

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

    const doe = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof doe?.requestPermission === 'function') doe.requestPermission().catch(() => {})
    setPhase('intro')
  }, [ensureAudio, chime, whoosh])


  const jump = useCallback((i: number) => {
    if (i === eraIdx) return
    ensureAudio()
    warp()
    setDir(i > eraIdx ? 1 : -1)
    setEraIdx(i)
  }, [eraIdx, ensureAudio, warp])


  useEffect(() => {
    let sx = 0, sy = 0, t = 0
    const ts = (e: TouchEvent) => { if (e.touches.length !== 1) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; t = performance.now() }
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx
      const dy = e.changedTouches[0].clientY - sy
      const dt = performance.now() - t
      if (dt > 600 || Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 50) return
      if (dx < 0) {
        if (phase === 'menu') begin()
        else if (phase === 'era') next()
        else if (phase === 'finale') setPhase('credits')
        else if (phase === 'credits') { setPhase('menu'); setEraIdx(0) }
      } else {
        if (phase === 'era') prev()
      }
    }
    window.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchend', te, { passive: true })
    return () => { window.removeEventListener('touchstart', ts); window.removeEventListener('touchend', te) }
  }, [phase, next, prev, begin])


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault()
        if (phase === 'menu') begin()
        else if (phase === 'era') next()
        else if (phase === 'finale') setPhase('credits')
        else if (phase === 'credits') { setPhase('menu'); setEraIdx(0) }
      }
      if (e.code === 'ArrowLeft') { e.preventDefault(); if (phase === 'era') prev() }
      if (e.code === 'KeyM') setMuted((m) => !m)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, next, prev, begin])


  useEffect(() => {
    if (phase !== 'finale') return
    const id = window.setTimeout(() => setPhase('credits'), 6000)
    return () => window.clearTimeout(id)
  }, [phase])


  const onStageTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {

    const tgt = e.target as HTMLElement
    if (tgt.closest('button')) return
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const isBack = x < rect.width * 0.28 && phase === 'era' && eraIdx > 0
    if (isBack) prev()
    else next()
  }, [phase, eraIdx, next, prev])

  const era = ERAS[eraIdx]

  return (
    <div className="app" data-phase={phase} onClick={onStageTap}>
      <Starfield density={phase === 'boot' || phase === 'menu' ? 220 : 70} />

      {

}
      {phase !== 'boot' && (
        <Safe3D>
          <ImmersiveLayer
            accent={phase === 'era' ? era.accent : phase === 'finale' ? '#c470ff' : phase === 'credits' ? '#ffd700' : '#00d4ff'}
            artifactEmoji=""
            eraIndex={eraIdx}
          />
        </Safe3D>
      )}

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
              <span>tap or swipe on mobile</span>
            </div>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <div className="intro">
          <div className={`intro-stage s${introStage}`} key={introStage}>
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
            style={{ backgroundImage: `url(${era.image})`, ['--accent' as string]: era.accent } as React.CSSProperties}
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
            <button className="hud-icon" onClick={(e) => { e.stopPropagation(); setMuted((m) => !m) }} aria-label="mute">{muted ? '🔇' : '🔊'}</button>
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
            <span className="hud-count">{String(eraIdx + 1).padStart(2, '0')} / {ERAS.length}</span>
            {ERAS.map((e, i) => (
              <button
                key={e.id}
                className={`dot ${i === eraIdx ? 'current' : ''} ${i < eraIdx ? 'done' : ''}`}
                onClick={(ev) => { ev.stopPropagation(); jump(i) }}
                aria-label={`Jump to ${e.name}`}
                title={e.name}
                style={{ ['--c' as string]: e.accent, background: i <= eraIdx ? e.accent : 'transparent', borderColor: e.accent } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="nav">
            {eraIdx > 0 && (
              <button className="nav-btn prev" onClick={(e) => { e.stopPropagation(); prev() }} aria-label="previous">
                <span className="nav-arrow">◂</span>
                <span className="nav-label">{ERAS[eraIdx - 1].name}</span>
              </button>
            )}
            <button className="nav-btn next" onClick={(e) => { e.stopPropagation(); next() }} aria-label="next">
              <span className="nav-label">
                {eraIdx < ERAS.length - 1 ? ERAS[eraIdx + 1].name : 'THE FINALE'}
              </span>
              <span className="nav-arrow">▸</span>
            </button>
          </div>

          <div className="swipe-hint">← swipe · tap →</div>
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
            <div className="finale-hint">tap to continue</div>
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
            <button className="btn-primary" onClick={(e) => { e.stopPropagation(); setPhase('menu'); setEraIdx(0) }}>↻ JOURNEY AGAIN</button>
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
