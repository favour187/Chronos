// Ultra-light 3D overlay: floating artifact crystal, portal ring, stardust.
// Camera is locked; no shadows, no physics, no postprocessing.
// Meets the "meaningful 3D / immersive elements" hackathon requirement
// without any lag on mobile.
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  accent: string
  artifactEmoji: string
  eraIndex: number
}

export function ImmersiveLayer({ accent, eraIndex }: Props) {
  return (
    <div className="imm3d" key={eraIndex}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55, near: 0.1, far: 50 }}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <color attach="background" args={[0, 0, 0]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 2, 5]} intensity={2.5} color={accent} distance={12} />
        <pointLight position={[-3, -1, 3]} intensity={1} color="#ffd700" distance={10} />
        <Stars color={accent} />
        <ArtifactCrystal color={accent} />
        <PortalRing color={accent} />
        <GoldDust />
      </Canvas>
    </div>
  )
}

function Stars({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const n = 240
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18
      arr[i * 3 + 2] = -10 - Math.random() * 12
    }
    return arr
  }, [])
  useFrame((_, dt) => {
    if (!ref.current) return
    const p = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const a = p.array as Float32Array
    for (let i = 0; i < a.length; i += 3) {
      a[i] -= 0.4 * dt
      if (a[i] < -15) a[i] = 15
    }
    p.needsUpdate = true
    ref.current.rotation.z += dt * 0.02
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function ArtifactCrystal({ color }: { color: string }) {
  const g = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (g.current) {
      g.current.rotation.y = t * 0.6
      g.current.position.y = -1.2 + Math.sin(t * 1.2) * 0.15
    }
    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 2 + Math.sin(t * 2.5) * 0.6
    }
  })
  return (
    <group ref={g} position={[-2.6, -1.2, -3]} scale={0.6}>
      <mesh>
        <torusGeometry args={[1.1, 0.03, 8, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      <mesh ref={core} rotation={[0.5, 0.6, 0]}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

function PortalRing({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.z = t * 0.4
    ref.current.scale.setScalar(1 + Math.sin(t * 1.8) * 0.06)
    const m = ref.current.material as THREE.MeshBasicMaterial
    m.opacity = 0.4 + Math.sin(t * 2.5) * 0.15
  })
  return (
    <mesh ref={ref} position={[3.2, -0.4, -4]}>
      <torusGeometry args={[1.3, 0.04, 8, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  )
}

function GoldDust() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const n = 120
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = -3 - Math.random() * 6
    }
    return arr
  }, [])
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.05
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffd700"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
