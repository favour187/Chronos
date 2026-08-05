import { useEffect, useRef } from 'react'

interface Props { density?: number }

/** Lightweight 2D canvas starfield — zero GPU cost, perfect 60fps on phones. */
export function Starfield({ density = 200 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    let w = 0, h = 0, raf = 0, t0 = performance.now()
    const stars: { x: number; y: number; z: number; r: number; a: number }[] = []
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.width = window.innerWidth * dpr
      h = canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      stars.length = 0
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 0.8 + 0.2,
          r: (Math.random() * 1.4 + 0.3) * dpr,
          a: Math.random() * 0.7 + 0.2,
        })
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (t: number) => {
      const dt = (t - t0) / 1000
      t0 = t
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        s.x -= s.z * 6 * dt * (window.innerWidth < 900 ? 0.4 : 1)
        if (s.x < 0) s.x = w
        const tw = 0.6 + Math.sin(t * 0.001 * s.z + s.x) * 0.4
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, ${220 + Math.floor(Math.random() * 5)}, ${180 + Math.floor(Math.random() * 40)}, ${s.a * tw})`
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [density])

  return <canvas ref={ref} className="starfield" aria-hidden />
}
