// Procedural audio engine built on WebAudio - no external asset dependency.
// Provides: heartbeat hum, ambience per era, interaction chimes, thunder, whoosh, rumble.

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
    masterGain.gain.value = 0.5
    masterGain.connect(ctx.destination)
    ctx._masterGain = masterGain
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function setMuted(muted: boolean) {
  if (!masterGain) return
  masterGain.gain.setTargetAtTime(muted ? 0 : 0.5, ensureCtx().currentTime, 0.1)
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.2, slideTo?: number) {
  const c = ensureCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, c.currentTime)
  if (slideTo !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), c.currentTime + dur)
  g.gain.setValueAtTime(0.0001, c.currentTime)
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  o.connect(g).connect(masterGain!)
  o.start()
  o.stop(c.currentTime + dur + 0.05)
}

function chime() {
  tone(880, 1.2, 'sine', 0.18)
  setTimeout(() => tone(1320, 1.5, 'triangle', 0.12), 120)
  setTimeout(() => tone(1760, 2.0, 'sine', 0.08), 260)
}

function thunder() {
  const c = ensureCtx()
  const buffer = c.createBuffer(1, c.sampleRate * 2.0, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2)
  }
  const src = c.createBufferSource()
  src.buffer = buffer
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 400
  const g = c.createGain()
  g.gain.value = 0.55
  src.connect(lp).connect(g).connect(masterGain!)
  src.start()
}

function whoosh(dur = 1.2) {
  const c = ensureCtx()
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length
    const env = Math.sin(Math.PI * t) // fade in/out
    data[i] = (Math.random() * 2 - 1) * env
  }
  const src = c.createBufferSource()
  src.buffer = buffer
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 900
  bp.Q.value = 0.8
  const g = c.createGain()
  g.gain.value = 0.35
  src.connect(bp).connect(g).connect(masterGain!)
  src.start()
}

function crack() {
  tone(120, 0.2, 'sawtooth', 0.4, 40)
  setTimeout(() => tone(80, 0.4, 'square', 0.2, 30), 80)
}

function heartbeat(patternBpm = 60) {
  if (heartbeatTimer) window.clearInterval(heartbeatTimer)
  const beatMs = 60000 / patternBpm
  heartbeatTimer = window.setInterval(() => {
    tone(70, 0.12, 'sine', 0.35)
    setTimeout(() => tone(90, 0.18, 'sine', 0.25), 180)
  }, beatMs)
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    window.clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function startAmbient(accent: string) {
  stopAmbient()
  const c = ensureCtx()
  // Two detuned oscillators = a soft pad
  const freqs = [110, 165, 220]
  const g = c.createGain()
  g.gain.value = 0.05
  const oscs: OscillatorNode[] = []
  freqs.forEach((f, i) => {
    const o = c.createOscillator()
    o.type = i === 0 ? 'sine' : 'triangle'
    o.frequency.value = f
    const lfo = c.createOscillator()
    lfo.frequency.value = 0.1 + i * 0.05
    const lfoGain = c.createGain()
    lfoGain.gain.value = 4
    lfo.connect(lfoGain).connect(o.frequency)
    o.connect(g)
    o.start()
    lfo.start()
    oscs.push(o, lfo)
  })
  g.connect(masterGain!)
  // crossfade music color toward accent (approx by changing dominant freq)
  ambientNodes = {
    stop: () => {
      try {
        g.gain.setTargetAtTime(0.0001, c.currentTime, 0.5)
        setTimeout(() => {
          oscs.forEach((o) => {
            try {
              o.stop()
            } catch {
              /* noop */
            }
          })
          try {
            g.disconnect()
          } catch {
            /* noop */
          }
        }, 800)
      } catch {
        /* noop */
      }
    },
  }
  void accent
}

function stopAmbient() {
  if (ambientNodes) ambientNodes.stop()
  ambientNodes = null
}

function warp(duration = 2) {
  const c = ensureCtx()
  const o = c.createOscillator()
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(40, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(2000, c.currentTime + duration)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.2, c.currentTime + 0.3)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 800
  o.connect(bp).connect(g).connect(masterGain!)
  o.start()
  o.stop(c.currentTime + duration + 0.1)
}

function click() {
  tone(600, 0.06, 'square', 0.1)
}

export const sfx = {
  ensureCtx,
  setMuted,
  chime,
  thunder,
  whoosh,
  crack,
  warp,
  click,
  heartbeat,
  stopHeartbeat,
  startAmbient,
  stopAmbient,
}
