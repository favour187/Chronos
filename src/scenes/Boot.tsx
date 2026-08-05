import { useEffect } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../store/game'
import { Particles } from '../components/scene/Particles'
import { sfx } from '../audio/engine'

export function Boot() {
  const progress = useGame((s) => s.loadingProgress)
  const setLoading = useGame((s) => s.setLoading)
  const setPhase = useGame((s) => s.setPhase)

  useEffect(() => {
    let p = 0
    const id = window.setInterval(() => {
      p += 0.04 + Math.random() * 0.08
      if (p >= 1) {
        p = 1
        window.clearInterval(id)
        setLoading(1)
        window.setTimeout(() => setPhase('menu'), 400)
      } else {
        setLoading(p)
      }
    }, 90)
    return () => window.clearInterval(id)
  }, [setLoading, setPhase])

  const pct = Math.round(progress * 100)

  return (
    <div className="boot-wrap">
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }} dpr={[1, 2]}>
        <color attach="background" args={['#05050d']} />
        <BootBackdrop />
        <ambientLight intensity={0.2} />
        <Particles count={600} color="#ffd700" size={0.07} radius={14} shape="sphere" speed={0.3} />
        <Particles count={200} color="#00d4ff" size={0.05} radius={10} shape="dust" speed={0.2} />
      </Canvas>
      <div className="boot-overlay">
        <div className="boot-logo">CHRONOS</div>
        <div className="boot-sub">THE LIVING TIMELINE</div>
        <div className="boot-bar">
          <div className="boot-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="boot-pct">{pct}%</div>
        <div className="boot-hint">Aligning temporal coordinates…</div>
        <button
          className="boot-unmute"
          onClick={() => {
            sfx.ensureCtx()
            sfx.setMuted(false)
          }}
        >
          🔊 Enable audio for the full experience
        </button>
      </div>
    </div>
  )
}

function BootBackdrop() {
  const tex = useLoader(THREE.TextureLoader, '/images/boot-stars.jpg')
  useEffect(() => {
    if (tex) tex.colorSpace = THREE.SRGBColorSpace
  }, [tex])
  return (
    <mesh scale={[600, 600, 600]} renderOrder={-1000}>
      <sphereGeometry args={[1, 64, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} transparent opacity={0.85} />
    </mesh>
  )
}
