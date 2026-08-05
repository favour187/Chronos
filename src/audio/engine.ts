// Procedural audio engine built on WebAudio - no external asset dependency.
// Volumes tuned for a calm cinematic feel (no harsh beeps / loud cracks).

type Ctx = AudioContext & { _masterGain?: GainNode }

let ctx: Ctx | null = null
let masterGain: GainNode | null = null
let ambientNodes: { stop: () => void } | null = null
let heartbeatTimer: number | null = null

function ensureCtx(): Ctx {
  if (!ctx) {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
    ctx = new AC() as Ctx
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.3
    masterGain.connect(ctx.destination)
    ctx._masterGain = masterGain
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function setMuted(muted: boolean) {
  if (!masterGain) return
  masterGain.gain.setTargetAtTime(muted ? 0 : 0.3, ensureCtx().currentTime, 0.25)
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.12, slideTo?: number) {
  const c = ensureCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2000
  o.type = type
  o.frequency.setValueAtTime(freq, c.currentTime)
  if (slideTo !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), c.currentTime + dur)
  g.gain.setValueAtTime(0.0001, c.currentTime)
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.05)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  o.connect(lp).connect(g).connect(masterGain!)
  o.start()
  o.stop(c.currentTime + dur + 0.1)
}

function chime() {
  // soft celestial chord
  tone(523.25, 2.0, 'sine', 0.08)
  setTimeout(() => tone(659.25, 2.2, 'sine', 0.06), 180)
  setTimeout(() => tone(783.99, 2.6, 'sine', 0.05), 360)
}

function thunder() {
  const c = ensureCtx()
  const dur = 2.4
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.8) * 0.6
  }
  const src = c.createBufferSource()
  src.buffer = buffer
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 200
  const g = c.createGain()
  g.gain.value = 0.2
  src.connect(lp).connect(g).connect(masterGain!)
  src.start()
}

function whoosh(dur = 0.9) {
  const c = ensureCtx()
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length
    data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t)
  }
  const src = c.createBufferSource()
  src.buffer = buffer
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 450
  const g = c.createGain()
  g.gain.value = 0.15
  src.connect(bp).connect(g).connect(masterGain!)
  src.start()
}

function crack() {
  tone(180, 0.5, 'triangle', 0.1, 60)
  setTimeout(() => tone(120, 0.8, 'sine', 0.08, 50), 120)
}

function heartbeat(patternBpm = 54) {
  if (heartbeatTimer) window.clearInterval(heartbeatTimer)
  const beatMs = 60000 / patternBpm
  heartbeatTimer = window.setInterval(() => {
    tone(55, 0.25, 'sine', 0.2)
    setTimeout(() => tone(72, 0.35, 'sine', 0.15), 260)
  }, beatMs)
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    window.clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function startAmbient(_accent: string) {
  stopAmbient()
  const c = ensureCtx()
  const g = c.createGain()
  g.gain.value = 0.02
  const freqs = [110, 164.81, 220]
  const oscs: OscillatorNode[] = []
  freqs.forEach((f, i) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    const lfo = c.createOscillator()
    lfo.frequency.value = 0.07 + i * 0.04
    const lfoGain = c.createGain()
    lfoGain.gain.value = 1.5
    lfo.connect(lfoGain).connect(o.frequency)
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    o.connect(lp).connect(g)
    o.start()
    lfo.start()
    oscs.push(o, lfo)
  })
  g.connect(masterGain!)
  ambientNodes = {
    stop: () => {
      try {
        g.gain.setTargetAtTime(0.0001, c.currentTime, 0.8)
        setTimeout(() => {
          oscs.forEach((o) => { try { o.stop() } catch { /* noop */ } })
          try { g.disconnect() } catch { /* noop */ }
        }, 1000)
      } catch { /* noop */ }
    },
  }
}

function stopAmbient() {
  if (ambientNodes) ambientNodes.stop()
  ambientNodes = null
}

function warp(duration = 1.5) {
  const c = ensureCtx()
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(100, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(600, c.currentTime + duration)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.08, c.currentTime + 0.4)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1000
  o.connect(lp).connect(g).connect(masterGain!)
  o.start()
  o.stop(c.currentTime + duration + 0.1)
}

function click() {
  tone(800, 0.05, 'sine', 0.06)
}

export const sfx = {
  ensureCtx, setMuted, chime, thunder, whoosh, crack, warp, click,
  heartbeat, stopHeartbeat, startAmbient, stopAmbient,
}
