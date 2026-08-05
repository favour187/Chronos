// Final cinematic: AI galaxy backdrop + procedural Earth in foreground
import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
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
        <CreditsScene />
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={1.3} luminanceThreshold={0.25} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={1} />
        </EffectComposer>
      </Canvas>
      <div className="credits-overlay">
        <div className="credits-final-quote">
          &ldquo;The future is created by those<br />who understand the past.&rdquo;
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
        <div className="credits-fine">CHRONOS · The Living Timeline · Built with React Three Fiber · AI imagery</div>
      </div>
    </div>
  )
}

function CreditsScene() {
  const galaxyTex = useLoader(THREE.TextureLoader, '/images/credits-galaxy.jpg')
  const earthTex = useLoader(THREE.TextureLoader, '/images/earth-solar.jpg')
  useEffect(() => {
    if (galaxyTex) galaxyTex.colorSpace = THREE.SRGBColorSpace
    if (earthTex) earthTex.colorSpace = THREE.SRGBColorSpace
  }, [galaxyTex, earthTex])

  const earth = useRef<THREE.Mesh>(null)
  const sun = useRef<THREE.Mesh>(null)
  const camZ = useRef(8)

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime()
    if (t < 5) camZ.current = 8 - t * 0.4
    else if (t < 12) camZ.current = 6 - (t - 5) * 0.6
    else camZ.current = 2 - (t - 12) * 0.02
    camera.position.z = camZ.current
    if (earth.current) {
      earth.current.rotation.y = t * 0.2
      earth.current.visible = t < 12
    }
    if (sun.current) {
      sun.current.visible = t > 4 && t < 14
      const s = 1 + Math.max(0, (t - 4) * 0.4)
      sun.current.scale.setScalar(s)
    }
  })

  return (
    <group>
      <color attach="background" args={['#000']} />
      {/* AI galaxy backdrop */}
      <mesh scale={[800, 800, 800]} renderOrder={-1000}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial map={galaxyTex} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <ambientLight intensity={0.2} />
      <pointLight color="#5ee5ff" intensity={4} distance={60} position={[10, 5, 0]} />
      <Stars radius={120} depth={60} count={2000} factor={4} fade speed={0.3} />
      <Particles count={600} color="#ffffff" size={0.04} radius={60} shape="sphere" speed={0.05} />

      {/* Earth */}
      <mesh ref={earth} position={[0, 0, 0]}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshStandardMaterial map={earthTex} emissive="#112244" emissiveIntensity={0.2} roughness={0.85} />
      </mesh>
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.95, 48, 48]} />
        <meshBasicMaterial color="#5ee5ff" transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>
      {/* Sun */}
      <mesh ref={sun} position={[0, 0, -30]}>
        <sphereGeometry args={[6, 48, 48]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffa500" emissiveIntensity={2} />
        <pointLight color="#ffd700" intensity={10} distance={120} />
      </mesh>
    </group>
  )
}
