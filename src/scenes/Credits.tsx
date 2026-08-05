// Final cinematic: Earth -> Solar System -> Galaxy -> Universe
import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Stars } from '@react-three/drei'
import { useGame } from '../store/game'
import { sfx } from '../audio/engine'
import { Particles } from '../components/scene/Particles'

export function Credits() {
  const reset = useGame((s) => s.reset)
  const setPhase = useGame((s) => s.setPhase)

  useEffect(() => {
    sfx.startAmbient('#ffd700')
  }, [])

  return (
    <div className="credits-wrap">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#000']} />
        <ambientLight intensity={0.3} />
        <pointLight color="#5ee5ff" intensity={4} distance={60} position={[10, 5, 0]} />
        <FinalZoom />
        <Stars radius={120} depth={60} count={3000} factor={4} fade speed={0.5} />
        <Particles count={600} color="#ffffff" size={0.04} radius={60} shape="sphere" speed={0.05} />
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={1.2} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={1} />
        </EffectComposer>
      </Canvas>
      <div className="credits-overlay">
        <div className="credits-final-quote">
          “The future is created by those<br />who understand the past.”
        </div>
        <div className="credits-thanks">Thank you for traveling through time.</div>
        <div className="credits-actions">
          <button
            className="btn-primary"
            onClick={() => {
              sfx.click()
              reset()
              setPhase('menu')
            }}
          >
            ↻ JOURNEY AGAIN
          </button>
        </div>
        <div className="credits-fine">CHRONOS \u00b7 The Living Timeline \u00b7 Built with React Three Fiber</div>
      </div>
    </div>
  )
}

function FinalZoom() {
  const earth = useRef<THREE.Mesh>(null)
  const sun = useRef<THREE.Mesh>(null)
  const galaxy = useRef<THREE.Mesh>(null)
  const camZ = useRef(8)

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime()
    // Phase 1 (0-5): close on Earth
    // Phase 2 (5-10): sun dominates
    // Phase 3 (10-15): galaxy
    if (t < 5) {
      camZ.current = 8 - t * 0.4
    } else if (t < 10) {
      camZ.current = 6 - (t - 5) * 0.8
    } else {
      camZ.current = 2 - (t - 10) * 0.05
    }
    camera.position.z = camZ.current
    if (earth.current) {
      earth.current.rotation.y = t * 0.3
      earth.current.visible = t < 10
    }
    if (sun.current) {
      sun.current.rotation.y = t * 0.05
      sun.current.visible = t > 3 && t < 12
      sun.current.scale.setScalar(1 + Math.max(0, (t - 3) * 0.5))
    }
    if (galaxy.current) {
      galaxy.current.rotation.z = t * 0.05
      galaxy.current.visible = t > 8
      galaxy.current.scale.setScalar(0.5 + Math.max(0, (t - 8) * 0.6))
    }
  })

  return (
    <group>
      {/* Earth */}
      <mesh ref={earth} position={[0, 0, 0]}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshStandardMaterial color="#1f6fb3" emissive="#1f6fb3" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
      {/* Continents (rough) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.805, 24, 24]} />
        <meshStandardMaterial color="#3aa04d" wireframe transparent opacity={0.2} />
      </mesh>
      {/* Atmosphere halo */}
      <mesh>
        <sphereGeometry args={[1.95, 48, 48]} />
        <meshBasicMaterial color="#5ee5ff" transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>
      {/* Sun */}
      <mesh ref={sun} position={[0, 0, -30]}>
        <sphereGeometry args={[6, 48, 48]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffa500" emissiveIntensity={2} />
        <pointLight color="#ffd700" intensity={10} distance={100} />
      </mesh>
      {/* Galaxy */}
      <mesh ref={galaxy} position={[0, 0, -80]}>
        <circleGeometry args={[20, 64]} />
        <meshBasicMaterial color="#c470ff" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
