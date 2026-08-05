// Ultra-light 3D overlay: floating artifact crystal, portal ring, stardust, gold dust.
// Camera is locked; no shadows, no physics, no postprocessing.
// Meets the "meaningful 3D / immersive elements" hackathon requirement
// without any lag on mobile. Canvas stays mounted across era changes so we
// don't rebuild WebGL resources every slide (no hitches, no black flashes).
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'

interface Props {
  accent: string
  artifactEmoji: string
  eraIndex: number
}

// Shared target accent color (hex string) that scene elements lerp toward.
// Mutated externally; scene reads it each frame via a ref that's forwarded.
function useAccentTarget(hex: string) {
  const target = useRef(new THREE.Color(hex))
  target.current.set(hex)
  return target
}

export function ImmersiveLayer({ accent }: Props) {
  const targetRef = useAccentTarget(accent)
  return (
    <div className="imm3d" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55, near: 0.1, far: 50 }}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.55} />
        <AccentLights targetRef={targetRef} />
        <pointLight position={[-3, -1, 3]} intensity={0.9} color="#ffd700" distance={10} />
        <Stars targetRef={targetRef} />
        <ArtifactCrystal targetRef={targetRef} />
        <PortalRing targetRef={targetRef} />
        <GoldDust />
        <AccentSync hex={accent} targetRef={targetRef} />
      </Canvas>
    </div>
  )
}

// Tiny invisible component that feeds the latest accent prop into the shared
// target color each frame, so scene objects can lerp toward it smoothly.
function AccentSync({ hex, targetRef }: { hex: string; targetRef: MutableRefObject<THREE.Color> }) {
  useFrame(() => { targetRef.current.set(hex) })
  return null
}

function AccentLights({ targetRef }: { targetRef: MutableRefObject<THREE.Color> }) {
  const light1 = useRef<THREE.PointLight>(null)
  const cur = useMemo(() => new THREE.Color('#ffffff'), [])
  useFrame((_, dt) => {
    if (!light1.current) return
    cur.lerp(targetRef.current, Math.min(1, dt * 4))
    light1.current.color.copy(cur)
  })
  return <pointLight ref={light1} position={[0, 2, 5]} intensity={2.4} distance={12} />
}

function Stars({ targetRef }: { targetRef: MutableRefObject<THREE.Color> }) {
  const ref = useRef<THREE.Points>(null)
  const cur = useMemo(() => new THREE.Color(targetRef.current), [])
  const positions = useMemo(() => {
    const n = 220
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
    const mat = ref.current.material as THREE.PointsMaterial
    cur.lerp(targetRef.current, Math.min(1, dt * 3))
    mat.color.copy(cur)
    const p = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const a = p.array as Float32Array
    for (let i = 0; i < a.length; i += 3) {
      a[i] -= 0.25 * dt
      if (a[i] < -15) a[i] = 15
    }
    p.needsUpdate = true
    ref.current.rotation.z += dt * 0.015
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function ArtifactCrystal({ targetRef }: { targetRef: MutableRefObject<THREE.Color> }) {
  const g = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const cur = useMemo(() => new THREE.Color(targetRef.current), [])
  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    if (g.current) {
      g.current.rotation.y = t * 0.5
      g.current.position.y = -1.1 + Math.sin(t * 1.1) * 0.14
    }
    cur.lerp(targetRef.current, Math.min(1, dt * 3))
    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial
      m.color.copy(cur)
      m.emissive.copy(cur)
      m.emissiveIntensity = 2 + Math.sin(t * 2.2) * 0.6
    }
    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial
      m.color.copy(cur)
      m.opacity = 0.55 + Math.sin(t * 1.6) * 0.1
    }
  })
  return (
    <group ref={g} position={[-2.4, -1.1, -3]} scale={0.55}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.025, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <mesh ref={core} rotation={[0.5, 0.6, 0]}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2}
          metalness={0.8}
          roughness={0.18}
        />
      </mesh>
    </group>
  )
}

function PortalRing({ targetRef }: { targetRef: MutableRefObject<THREE.Color> }) {
  const ref = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const cur = useMemo(() => new THREE.Color(targetRef.current), [])
  useFrame(({ clock }, dt) => {
    if (!ref.current || !inner.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.z = t * 0.35
    inner.current.rotation.z = -t * 0.5
    const s = 1 + Math.sin(t * 1.6) * 0.05
    ref.current.scale.setScalar(s)
    inner.current.scale.setScalar(1 + Math.sin(t * 2.1) * 0.04)
    cur.lerp(targetRef.current, Math.min(1, dt * 3))
    const m = ref.current.material as THREE.MeshBasicMaterial
    const mi = inner.current.material as THREE.MeshBasicMaterial
    m.color.copy(cur)
    mi.color.copy(cur)
    m.opacity = 0.45 + Math.sin(t * 2.2) * 0.15
    mi.opacity = 0.25 + Math.sin(t * 2.8 + 1) * 0.1
  })
  return (
    <group position={[3.0, -0.3, -4]}>
      <mesh ref={ref}>
        <torusGeometry args={[1.3, 0.035, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[0.95, 0.018, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function GoldDust() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const n = 110
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
    ref.current.rotation.y += dt * 0.04
    ref.current.rotation.x += dt * 0.02
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#ffd700"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
