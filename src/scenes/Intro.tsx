// Cinematic intro: heartbeat -> particles -> clock -> crack -> freeze -> portal -> tunnel
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useGame } from '../store/game'
import { Particles } from '../components/scene/Particles'
import { sfx } from '../audio/engine'

const STAGES = [
  { name: 'heartbeat', dur: 2.5 },
  { name: 'particles', dur: 3.0 },
  { name: 'clock', dur: 3.0 },
  { name: 'crack', dur: 1.8 },
  { name: 'freeze', dur: 1.2 },
  { name: 'portal', dur: 2.5 },
]

export function Intro() {
  const stage = useGame((s) => s.introStage)
  const setStage = useGame((s) => s.setIntroStage)
  const setPhase = useGame((s) => s.setPhase)
  const t0 = useRef(performance.now())

  useEffect(() => {
    t0.current = performance.now()
    sfx.heartbeat(58)
    return () => sfx.stopHeartbeat()
  }, [])

  useEffect(() => {
    let raf = 0
    const loop = () => {
      const elapsed = (performance.now() - t0.current) / 1000
      let acc = 0
      let nextStage = stage
      for (let i = 0; i < STAGES.length; i++) {
        if (elapsed < acc + STAGES[i].dur) {
          nextStage = i
          break
        }
        acc += STAGES[i].dur
        if (i === STAGES.length - 1) nextStage = STAGES.length
      }
      if (nextStage !== stage) {
        if (STAGES[nextStage]?.name === 'crack') {
          sfx.crack()
          sfx.thunder()
        }
        if (STAGES[nextStage]?.name === 'portal') {
          sfx.warp(2)
          sfx.whoosh(1.5)
        }
        setStage(nextStage)
      }
      if (nextStage >= STAGES.length) {
        setPhase('tunnel')
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [stage, setStage, setPhase])

  const s = (STAGES[stage]?.name ?? 'portal') as IntroStage
  return (
    <div className="intro-wrap">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#000']} />
        <IntroScene stage={s} />
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={1.2} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.1} darkness={0.9} />
        </EffectComposer>
      </Canvas>
      <div className="intro-subtitle">
        {s === 'heartbeat' && <span className="flicker">IN THE BEGINNING, THERE WAS DARKNESS…</span>}
        {s === 'particles' && <span>STARDUST COALESCES</span>}
        {s === 'clock' && <span>A CLOCK FORMS FROM ETERNITY</span>}
        {s === 'crack' && <span className="shake">TIME SHATTERS</span>}
        {s === 'freeze' && <span className="slow">EVERYTHING FREEZES</span>}
        {s === 'portal' && <span className="glow">THE PORTAL OPENS</span>}
      </div>
      <button className="intro-skip" onClick={() => setPhase('tunnel')}>SKIP ⏭</button>
    </div>
  )
}

type IntroStage = 'heartbeat' | 'particles' | 'clock' | 'crack' | 'freeze' | 'portal'

function IntroScene({ stage }: { stage: IntroStage }) {
  const clock = useRef<THREE.Group>(null)
  const portal = useRef<THREE.Mesh>(null)
  const shardsGroup = useRef<THREE.Group>(null)
  const camZ = useRef(8)

  const heroTex = useLoader(THREE.TextureLoader, '/images/hero.jpg')
  useEffect(() => {
    if (heroTex) heroTex.colorSpace = THREE.SRGBColorSpace
  }, [heroTex])

  const shardData = useMemo(() => {
    return Array.from({ length: 24 }, () => {
      const a = Math.random() * Math.PI * 2
      return {
        pos: new THREE.Vector3(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0),
        vel: new THREE.Vector3(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.2 - Math.random() * 0.4),
        rot: new THREE.Euler(Math.random(), Math.random(), Math.random()),
        rotV: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.3),
      }
    })
  }, [])

  useFrame(({ camera, clock: { elapsedTime: t } }) => {
    if (clock.current) {
      const appear = stage === 'heartbeat' ? 0 : stage === 'particles' ? Math.min(1, t / 3) : 1
      clock.current.scale.setScalar(appear * (1 + Math.sin(t * 2) * 0.03))
      clock.current.rotation.z = t * 0.15
      clock.current.visible = stage !== 'portal'
      if (stage === 'crack') clock.current.rotation.z += Math.sin(t * 40) * 0.01
    }
    if (portal.current) {
      const s = stage === 'portal' ? (1 + Math.sin(t * 4) * 0.1) * 2.5 : 0.001
      portal.current.scale.setScalar(s)
      ;(portal.current.material as THREE.MeshBasicMaterial).opacity =
        stage === 'portal' ? 0.8 + Math.sin(t * 4) * 0.2 : 0
    }
    const targetZ = stage === 'portal' ? -2 : stage === 'freeze' ? 5 : 8
    camZ.current += (targetZ - camZ.current) * 0.04
    camera.position.z = camZ.current
    if ((stage === 'freeze' || stage === 'portal') && shardsGroup.current) {
      const frozen = stage === 'freeze'
      shardsGroup.current.children.forEach((ch, i) => {
        const sh = shardData[i]
        if (!sh) return
        if (!frozen) sh.pos.add(sh.vel.clone().multiplyScalar(0.05))
        ch.position.copy(sh.pos)
        sh.rot.x += sh.rotV.x * (frozen ? 0.002 : 0.02)
        sh.rot.y += sh.rotV.y * (frozen ? 0.002 : 0.02)
        ch.rotation.copy(sh.rot)
      })
    }
  })

  return (
    <group>
      {/* AI-generated cinematic hero backdrop */}
      <mesh scale={[800, 800, 800]} renderOrder={-1000}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial
          map={heroTex}
          side={THREE.BackSide}
          depthWrite={false}
          transparent
          opacity={stage === 'heartbeat' ? 0.15 : stage === 'particles' ? 0.35 : 0.65}
        />
      </mesh>

      <Particles count={1000} color="#ffd700" size={0.05} radius={18} shape="sphere" speed={stage === 'heartbeat' ? 0.05 : 0.4} />
      <Particles count={400} color="#00d4ff" size={0.04} radius={10} shape="dust" speed={0.2} />

      <group ref={clock}>
        <mesh>
          <torusGeometry args={[2.5, 0.08, 16, 128]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh>
          <circleGeometry args={[2.4, 64]} />
          <meshBasicMaterial color="#0a0a12" transparent opacity={0.6} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 12) * Math.PI * 2]} position={[0, 2.1, 0.01]}>
            <boxGeometry args={[0.05, 0.2, 0.02]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
        ))}
        <group>
          <mesh position={[0, 1.2, 0.02]}>
            <boxGeometry args={[0.06, 1.3, 0.03]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
          <mesh position={[0.7, 0, 0.02]} rotation={[0, 0, -Math.PI / 2]}>
            <boxGeometry args={[0.04, 1.1, 0.03]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
        </group>
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ffd700" />
        </mesh>
        {stage === 'crack' && (
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[5, 5]} />
            <meshBasicMaterial color="#ff006e" transparent opacity={0.5} />
          </mesh>
        )}
        <pointLight color="#ffd700" intensity={5} distance={20} />
      </group>

      <group ref={shardsGroup}>
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh key={i}>
            <tetrahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={1} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      <mesh ref={portal}>
        <circleGeometry args={[4, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#00d4ff" intensity={stage === 'portal' ? 12 : 0} distance={40} />
    </group>
  )
}
