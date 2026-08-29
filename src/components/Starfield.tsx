import { useEffect, useRef } from 'react'

interface Props { density?: number }





export function Starfield({ density = 200 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    let w = 0, h = 0, raf = 0
    const stars: { x: number; y: number; z: number; r: number; a: number; p: number }[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.width = Math.floor(window.innerWidth * dpr)
      h = canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      stars.length = 0
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 0.8 + 0.2,
          r: (Math.random() * 1.2 + 0.3) * dpr,
          a: Math.random() * 0.7 + 0.25,
          p: Math.random() * Math.PI * 2,
        })
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let last = performance.now()
    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      ctx.clearRect(0, 0, w, h)
      const speed = (window.innerWidth < 900 ? 28 : 60)
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        s.x -= s.z * speed * dt * (window.devicePixelRatio || 1)
        if (s.x < -2) s.x = w + 2
        const tw = 0.7 + Math.sin(t * 0.002 * s.z + s.p) * 0.3
        ctx.fillStyle = `rgba(255,236,205,${(s.a * tw).toFixed(3)})`
        ctx.beginPath()
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
