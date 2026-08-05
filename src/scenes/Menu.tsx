import { Canvas } from '@react-three/fiber'
import { useGame } from '../store/game'
import { Particles } from '../components/scene/Particles'
import { sfx } from '../audio/engine'

export function Menu() {
  const startGame = useGame((s) => s.startGame)
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)

  return (
    <div className="menu-wrap">
      <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 2]}>
        <color attach="background" args={['#05050d']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 2, 5]} intensity={2} color="#ffd700" />
        <pointLight position={[-4, -1, 2]} intensity={1.5} color="#00d4ff" />
        <Particles count={900} color="#ffd700" size={0.06} radius={16} shape="sphere" speed={0.25} />
        <Particles count={500} color="#c470ff" size={0.04} radius={8} shape="dust" speed={0.1} />
        <MenuClock />
      </Canvas>
      <div className="menu-overlay">
        <div className="menu-eyebrow">A 3D INTERACTIVE JOURNEY</div>
        <h1 className="menu-title">
          <span className="menu-title-word" style={{ animationDelay: '0.2s' }}>CHRONOS</span>
        </h1>
        <p className="menu-sub">The Living Timeline</p>
        <p className="menu-tag">
          Travel 13.8 billion years through time. Collect the artifacts.
          <br />
          Repair time itself.
        </p>
        <div className="menu-buttons">
          <button
            className="btn-primary"
            onClick={() => {
              sfx.ensureCtx()
              sfx.whoosh(0.8)
              startGame()
            }}
          >
            ▶ BEGIN JOURNEY
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              sfx.click()
              toggleMute()
            }}
          >
            {muted ? '🔇 Audio: OFF' : '🔊 Audio: ON'}
          </button>
        </div>
        <div className="menu-controls">
          <span><kbd>W A S D</kbd> move</span>
          <span><kbd>Drag</kbd> look</span>
          <span><kbd>Scroll</kbd> zoom</span>
          <span><kbd>Click</kbd> interact</span>
        </div>
      </div>
    </div>
  )
}

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function MenuClock() {
  const ring = useRef<THREE.Mesh>(null)
  const hand = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ring.current) ring.current.rotation.z = t * 0.2
    if (hand.current) hand.current.rotation.z = -t * 0.6
  })
  return (
    <group position={[0, 0, -2]}>
      <mesh ref={ring}>
        <torusGeometry args={[2.5, 0.05, 16, 128]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={1.5} />
      </mesh>
      <mesh>
        <torusGeometry args={[2.1, 0.02, 16, 128]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.4} />
      </mesh>
      <group ref={hand}>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.05, 1.7, 0.05]} />
          <meshBasicMaterial color="#ffd700" />
        </mesh>
      </group>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffd700" />
      </mesh>
      <pointLight color="#ffd700" intensity={3} distance={12} />
    </group>
  )
}
