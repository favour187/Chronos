// Cinematic intro: heartbeat -> particles -> clock -> crack -> freeze -> portal -> tunnel
import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
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
  const elapsed = useRef(0)

  useEffect(() => {
    t0.current = performance.now()
    sfx.heartbeat(58)
    return () => sfx.stopHeartbeat()
  }, [])

  useEffect(() => {
    let raf = 0
    const loop = () => {
      elapsed.current = (performance.now() - t0.current) / 1000
      let acc = 0
      let nextStage = stage
      for (let i = 0; i < STAGES.length; i++) {
        if (elapsed.current < acc + STAGES[i].dur) {
          nextStage = i
          break
        }
        acc += STAGES[i].dur
        if (i === STAGES.length - 1) nextStage = STAGES.length
      }
      if (nextStage !== stage) {
        // trigger stage-specific sfx
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

  const s = STAGES[stage]?.name ?? 'portal'
  return (
    <div className="intro-wrap">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#000']} />
        <ambientLight intensity={0.15} />
        <IntroScene stage={s} />
      </Canvas>
      <div className="intro-subtitle">
        {s === 'heartbeat' && <span className="flicker">IN THE BEGINNING, THERE WAS DARKNESS\u2026</span>}
        {s === 'particles' && <span>STARDUST COALESCES</span>}
        {s === 'clock' && <span>A CLOCK FORMS FROM ETERNITY</span>}
        {s === 'crack' && <span className="shake">TIME SHATTERS</span>}
        {s === 'freeze' && <span className="slow">EVERYTHING FREEZES</span>}
        {s === 'portal' && <span className="glow">THE PORTAL OPENS</span>}
      </div>
      <button className="intro-skip" onClick={() => setPhase('tunnel')}>
        SKIP ⏭
      </button>
    </div>
  )
}

function IntroScene({ stage }: { stage: string }) {
  const clock = useRef<THREE.Group>(null)
  const portal = useRef<THREE.Mesh>(null)
  const shardsGroup = useRef<THREE.Group>(null)
  const shards = useRef<{ pos: THREE.Vector3; vel: THREE.Vector3; rot: THREE.Euler; rotV: THREE.Vector3 }[]>([])
  const camZ = useRef(8)

  useFrame(({ camera, clock: { elapsedTime: t } }) => {
    if (clock.current) {
      const appear = stage === 'heartbeat' ? 0 : stage === 'particles' ? Math.min(1, t / 3) : 1
      clock.current.scale.setScalar(appear * (1 + Math.sin(t * 2) * 0.03))
      clock.current.rotation.z = t * 0.15
      clock.current.visible = stage !== 'portal' ? true : (t % 1) > 0.5
      if (stage === 'crack') {
        clock.current.rotation.z += Math.sin(t * 40) * 0.01
      }
    }
    if (portal.current) {
      const s = stage === 'portal' ? 1 + Math.sin(t * 4) * 0.1 : 0
      portal.current.scale.setScalar(stage === 'portal' ? s : 0.001)
      ;(portal.current.material as THREE.MeshBasicMaterial).opacity =
        stage === 'portal' ? 0.7 + Math.sin(t * 4) * 0.3 : 0
    }
    // Camera fly-in
    const targetZ = stage === 'portal' ? 0 : stage === 'freeze' ? 5 : 8
    camZ.current += (targetZ - camZ.current) * 0.04
    camera.position.z = camZ.current
    // Shards after crack
    if (stage === 'freeze' || stage === 'portal') {
      if (shards.current.length === 0 && shardsGroup.current) {
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2
          shards.current.push({
            pos: new THREE.Vector3(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0),
            vel: new THREE.Vector3(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.2 - Math.random() * 0.4),
            rot: new THREE.Euler(Math.random(), Math.random(), Math.random()),
            rotV: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.3),
          })
        }
        shardsGroup.current.children.forEach((ch, i) => {
          const sh = shards.current[i]
          ch.position.copy(sh.pos)
          ch.rotation.copy(sh.rot)
        })
      }
      const frozen = stage === 'freeze'
      shardsGroup.current?.children.forEach((ch, i) => {
        const sh = shards.current[i]
        if (!sh) return
        if (!frozen) {
          sh.pos.add(sh.vel.clone().multiplyScalar(0.05))
          ch.position.copy(sh.pos)
        }
        sh.rot.x += sh.rotV.x * (frozen ? 0.002 : 0.02)
        sh.rot.y += sh.rotV.y * (frozen ? 0.002 : 0.02)
        ch.rotation.copy(sh.rot)
      })
    }
  })

  return (
    <group>
      <Particles count={1200} color="#ffd700" size={0.05} radius={18} shape="sphere" speed={stage === 'heartbeat' ? 0.05 : 0.4} />
      <Particles count={500} color="#00d4ff" size={0.04} radius={10} shape="dust" speed={0.2} />
      <group ref={clock}>
        <mesh>
          <torusGeometry args={[2.5, 0.08, 16, 128]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh>
          <circleGeometry args={[2.4, 64]} />
          <meshBasicMaterial color="#0a0a12" />
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
        {/* Crack overlay (emissive jagged line) */}
        {stage === 'crack' && (
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[5, 5]} />
            <meshBasicMaterial color="#ff006e" transparent opacity={0.6} />
          </mesh>
        )}
        <pointLight color="#ffd700" intensity={5} distance={20} />
      </group>
      {/* Shards */}
      <group ref={shardsGroup}>
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh key={i}>
            <tetrahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={1} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>
      {/* Portal */}
      <mesh ref={portal}>
        <circleGeometry args={[4, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#00d4ff" intensity={stage === 'portal' ? 10 : 0} distance={30} />
    </group>
  )
}
