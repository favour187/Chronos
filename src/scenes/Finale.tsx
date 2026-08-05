import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useGame } from '../store/game'
import { ERAS } from '../eras/data'
import { sfx } from '../audio/engine'
import { Particles } from '../components/scene/Particles'

export function Finale() {
  const progress = useGame((s) => s.finaleProgress)
  const setProgress = useGame((s) => s.setFinaleProgress)
  const setPhase = useGame((s) => s.setPhase)
  const t0 = useRef(performance.now())

  useEffect(() => {
    sfx.startAmbient('#c470ff')
    sfx.warp(4)
  }, [])

  useEffect(() => {
    let raf = 0
    const loop = () => {
      const t = (performance.now() - t0.current) / 1000
      const p = Math.min(1, t / 12)
      setProgress(p)
      if (p >= 1) {
        window.setTimeout(() => setPhase('credits'), 1800)
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [setProgress, setPhase])

  return (
    <div className="finale-wrap">
      <Canvas camera={{ position: [0, 0, 10], fov: 70 }} dpr={[1, 2]}>
        <FinaleWorld progress={progress} />
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={1.8} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.1} darkness={0.95} />
        </EffectComposer>
      </Canvas>
      <div className="finale-overlay">
        <div className="finale-kicker">TIMELINE COLLAPSE</div>
        <h1 className="finale-title">TIME IS FRACTURING</h1>
        <p className="finale-desc">
          Every artifact gathered. Every era remembered. The Time Core assembles…
        </p>
        <div className="finale-bar">
          <div className="finale-bar-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

function FinaleWorld({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const erasGroup = useRef<THREE.Group>(null)
  const coreTex = useLoader(THREE.TextureLoader, '/images/time-core.jpg')
  const collapseTex = useLoader(THREE.TextureLoader, '/images/finale-collapse.jpg')

  useEffect(() => {
    if (coreTex) coreTex.colorSpace = THREE.SRGBColorSpace
    if (collapseTex) collapseTex.colorSpace = THREE.SRGBColorSpace
  }, [coreTex, collapseTex])

  const eraNodes = useMemo(() => ERAS.map((e) => ({ accent: e.accent })), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (group.current) group.current.rotation.y = t * 0.2
    if (core.current) {
      const s = 1.2 + Math.sin(t * 4) * 0.2 + progress * 3
      core.current.scale.setScalar(s)
      const mat = core.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 2 + Math.sin(t * 5) * 1 + progress * 3
    }
    if (erasGroup.current) {
      erasGroup.current.children.forEach((g, i) => {
        const e = eraNodes[i]
        if (!e) return
        const angle = (i / ERAS.length) * Math.PI * 2 + t * 0.3
        const radius = 14 - progress * 10
        g.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 2) * 3 * (1 - progress),
          -12 - Math.sin(angle) * radius * 0.5,
        )
        g.rotation.y = angle
        const firstChild = g.children[0] as THREE.Mesh | undefined
        if (firstChild?.material) {
          ;(firstChild.material as THREE.MeshStandardMaterial).emissiveIntensity =
            0.6 + Math.sin(t * 2 + i) * 0.4 + progress * 1.5
        }
      })
    }
  })

  return (
    <group>
      <color attach="background" args={['#050014']} />
      <fog attach="fog" args={['#120030', 10, 60]} />

      {/* AI-generated collapse scene as an enormous backdrop */}
      <mesh scale={[700, 700, 700]} renderOrder={-1000}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial map={collapseTex} side={THREE.BackSide} depthWrite={false} transparent opacity={0.75} />
      </mesh>

      <ambientLight intensity={0.2} />
      <pointLight color="#c470ff" intensity={8} distance={120} position={[0, 0, -10]} />
      <pointLight color="#ffd700" intensity={5} distance={60} position={[5, 5, -10]} />
      <Particles count={1200} color="#c470ff" size={0.1} radius={30} shape="sphere" speed={0.4} />
      <Particles count={400} color="#ffd700" size={0.08} radius={16} shape="dust" speed={0.3} />

      <group ref={group}>
        <group ref={erasGroup}>
          {ERAS.map((era) => (
            <group key={era.id}>
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={era.accent} emissive={era.accent} emissiveIntensity={0.8} />
              </mesh>
            </group>
          ))}
        </group>
        <SpinningRings progress={progress} />
        <group position={[0, 0, -12]}>
          <mesh ref={core}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              map={coreTex}
              color="#ffd700"
              emissive="#ffd700"
              emissiveIntensity={3}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <pointLight color="#ffd700" intensity={10} distance={60} />
        </group>
      </group>
    </group>
  )
}

function SpinningRings({ progress }: { progress: number }) {
  const ref1 = useRef<THREE.Mesh>(null)
  const ref2 = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref1.current) {
      ref1.current.rotation.x = t * 0.6
      ref1.current.rotation.y = t * 0.4
      ref1.current.scale.setScalar(2 + progress * 4)
    }
    if (ref2.current) {
      ref2.current.rotation.x = -t * 0.5
      ref2.current.rotation.z = t * 0.7
      ref2.current.scale.setScalar(3 + progress * 5)
    }
  })
  return (
    <group position={[0, 0, -12]}>
      <mesh ref={ref1}>
        <torusGeometry args={[1, 0.06, 8, 96]} />
        <meshBasicMaterial color="#c470ff" />
      </mesh>
      <mesh ref={ref2}>
        <torusGeometry args={[1, 0.04, 8, 96]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
    </group>
  )
}
