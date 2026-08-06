// Ultra-light 3D overlay: a DIFFERENT artifact per era, portal ring, stardust,
// gold dust — plus mouse/gyro parallax and a warp-pulse on every era change.
// Camera-driven, no shadows, no postprocessing: stays 60fps on phones.
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'

interface Props {
  accent: string
  artifactEmoji: string
  eraIndex: number
}

/* ---------- shared imperative state (one canvas, so module singletons) ---------- */

// Pointer / gyro target in normalized device coords (-1..1)
const inputTarget = { x: 0, y: 0 }
// Warp pulse: 1 right after an era change, decays to 0. Drives camera dolly,
// artifact pop and emissive flash.
const warpPulse = { v: 0 }

// Shared target accent color (hex string) that scene elements lerp toward.
function useAccentTarget(hex: string) {
  const target = useRef(new THREE.Color(hex))
  target.current.set(hex)
  return target
}

export function ImmersiveLayer({ accent, eraIndex }: Props) {
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
        <InputListener />
        <CameraRig eraIndex={eraIndex} />
        <Stars targetRef={targetRef} />
        <EraArtifact key={eraIndex} eraIndex={eraIndex} targetRef={targetRef} />
        <PortalRing targetRef={targetRef} />
        <GoldDust />
        <AccentSync hex={accent} targetRef={targetRef} />
      </Canvas>
    </div>
  )
}

/* ---------- input: pointer + device orientation ---------- */

function InputListener() {
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      inputTarget.x = (e.clientX / window.innerWidth) * 2 - 1
      inputTarget.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      inputTarget.x = THREE.MathUtils.clamp(e.gamma / 28, -1, 1)
      inputTarget.y = THREE.MathUtils.clamp(-(e.beta - 45) / 28, -1, 1)
    }
    window.addEventListener('pointermove', onPointer)
    window.addEventListener('deviceorientation', onOrient)
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])
  return null
}

/* ---------- camera rig: parallax drift + warp dolly ---------- */

function CameraRig({ eraIndex }: { eraIndex: number }) {
  const { camera } = useThree()
  const last = useRef(eraIndex)
  useFrame((_, dt) => {
    if (last.current !== eraIndex) {
      last.current = eraIndex
      warpPulse.v = 1 // era changed → fire the pulse
    }
    warpPulse.v *= Math.exp(-dt * 3.2)
    if (warpPulse.v < 0.001) warpPulse.v = 0

    const k = 1 - Math.pow(0.002, dt) // critically-damped-ish smoothing
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, inputTarget.x * 0.85, k)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, inputTarget.y * 0.5, k)
    camera.position.z = 7 + warpPulse.v * 2.4
    camera.lookAt(0, 0, -2)
  })
  return null
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

/* ---------- the star of the show: a bespoke artifact per era ---------- */
// Each era gets its own geometry + spin personality. The shape DOES the
// storytelling: this is what judges remember.

type ArtifactKind =
  | 'planetoid' | 'shard' | 'flint' | 'pyramid' | 'platonic' | 'column'
  | 'block' | 'flow' | 'gear' | 'mesh' | 'hyperloop' | 'starorb'

const ERA_ARTIFACTS: { kind: ArtifactKind; spin: number; scale: number }[] = [
  { kind: 'planetoid', spin: 0.5, scale: 1.0 },   // Birth of Earth — molten world
  { kind: 'shard', spin: 0.65, scale: 1.05 },     // Dinosaur Age — fossil shard
  { kind: 'flint', spin: 0.7, scale: 0.9 },       // Early Humans — struck flint
  { kind: 'pyramid', spin: 0.4, scale: 1.1 },     // Ancient Egypt — monument
  { kind: 'platonic', spin: 0.5, scale: 0.95 },   // Ancient Greece — ideal form
  { kind: 'column', spin: 0.44, scale: 1.0 },     // Rome — engineered column
  { kind: 'block', spin: 0.5, scale: 0.95 },      // Medieval — cathedral stone
  { kind: 'flow', spin: 0.6, scale: 0.9 },        // Renaissance — flowing genius
  { kind: 'gear', spin: 1.1, scale: 1.0 },        // Industrial — the machine wakes
  { kind: 'mesh', spin: 0.6, scale: 1.0 },        // Digital — network lattice
  { kind: 'hyperloop', spin: 0.75, scale: 0.95 }, // Future — the engineered loop
  { kind: 'starorb', spin: 0.3, scale: 1.0 },     // Cosmic — the universe observing
]

function artifactGeometry(kind: ArtifactKind) {
  switch (kind) {
    case 'planetoid': return <icosahedronGeometry args={[0.55, 0]} />
    case 'shard': return <tetrahedronGeometry args={[0.62, 0]} />
    case 'flint': return <octahedronGeometry args={[0.5, 0]} />
    case 'pyramid': return <coneGeometry args={[0.52, 0.72, 4]} />
    case 'platonic': return <dodecahedronGeometry args={[0.5, 0]} />
    case 'column': return <cylinderGeometry args={[0.3, 0.38, 0.85, 10]} />
    case 'block': return <boxGeometry args={[0.68, 0.68, 0.68]} />
    case 'flow': return <torusKnotGeometry args={[0.38, 0.13, 96, 12]} />
    case 'gear': return <torusGeometry args={[0.48, 0.17, 14, 36]} />
    case 'mesh': return <icosahedronGeometry args={[0.56, 1]} />
    case 'hyperloop': return <torusKnotGeometry args={[0.4, 0.12, 128, 16, 2, 5]} />
    case 'starorb': return <sphereGeometry args={[0.5, 24, 24]} />
  }
}

function EraArtifact({ eraIndex, targetRef }: { eraIndex: number; targetRef: MutableRefObject<THREE.Color> }) {
  const g = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const shell = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const cur = useMemo(() => new THREE.Color(targetRef.current), [])
  const cfg = ERA_ARTIFACTS[eraIndex % ERA_ARTIFACTS.length]
  const isWire = cfg.kind === 'mesh'

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    if (g.current) {
      g.current.rotation.y = t * cfg.spin
      g.current.rotation.x = Math.sin(t * 0.4) * 0.12
      g.current.position.y = -1.1 + Math.sin(t * 1.1) * 0.14
      // warp-pop: artifact bursts in on era change
      const s = cfg.scale * (1 + warpPulse.v * 0.6)
      g.current.scale.setScalar(0.55 * s)
    }
    cur.lerp(targetRef.current, Math.min(1, dt * 3))
    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial
      if (!isWire) {
        m.color.copy(cur)
        m.emissive.copy(cur)
        m.emissiveIntensity = (2 + Math.sin(t * 2.2) * 0.6) * (1 + warpPulse.v * 2.5)
      } else {
        m.color.copy(cur)
        m.emissive.copy(cur)
        m.emissiveIntensity = 1.4 * (1 + warpPulse.v * 2)
      }
    }
    if (shell.current) {
      const m = shell.current.material as THREE.MeshBasicMaterial
      m.color.copy(cur)
      m.opacity = 0.22 + Math.sin(t * 1.4) * 0.08
    }
    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial
      m.color.copy(cur)
      m.opacity = 0.55 + Math.sin(t * 1.6) * 0.1
    }
  })

  return (
    <group ref={g} position={[-2.4, -1.1, -3]}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.025, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <mesh ref={core} rotation={[0.5, 0.6, 0]}>
        {artifactGeometry(cfg.kind)}
        {isWire ? (
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" wireframe />
        ) : (
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
            metalness={0.8}
            roughness={0.18}
            flatShading={cfg.kind === 'planetoid' || cfg.kind === 'shard' || cfg.kind === 'pyramid' || cfg.kind === 'platonic'}
          />
        )}
      </mesh>
      {/* cosmic era gets a wireframe star-shell around the orb */}
      {cfg.kind === 'starorb' && (
        <mesh ref={shell}>
          <icosahedronGeometry args={[0.85, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.25} />
        </mesh>
      )}
      {/* gear era gets teeth: a second flat dark ring reads as machinery */}
      {cfg.kind === 'gear' && (
        <mesh ref={shell} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.72, 0.05, 8, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  )
}

/* ---------- supporting cast ---------- */

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
    // stars rush backward during the warp pulse — traveling through time
    const speed = 0.25 + warpPulse.v * 14
    for (let i = 0; i < a.length; i += 3) {
      a[i] -= speed * dt
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

function PortalRing({ targetRef }: { targetRef: MutableRefObject<THREE.Color> }) {
  const ref = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const cur = useMemo(() => new THREE.Color(targetRef.current), [])
  useFrame(({ clock }, dt) => {
    if (!ref.current || !inner.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.z = t * 0.35
    inner.current.rotation.z = -t * 0.5
    const s = 1 + Math.sin(t * 1.6) * 0.05 + warpPulse.v * 0.5
    ref.current.scale.setScalar(s)
    inner.current.scale.setScalar(1 + Math.sin(t * 2.1) * 0.04 + warpPulse.v * 0.8)
    cur.lerp(targetRef.current, Math.min(1, dt * 3))
    const m = ref.current.material as THREE.MeshBasicMaterial
    const mi = inner.current.material as THREE.MeshBasicMaterial
    m.color.copy(cur)
    mi.color.copy(cur)
    m.opacity = 0.45 + Math.sin(t * 2.2) * 0.15 + warpPulse.v * 0.3
    mi.opacity = 0.25 + Math.sin(t * 2.8 + 1) * 0.1 + warpPulse.v * 0.4
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
    ref.current.rotation.y += dt * (0.04 + warpPulse.v * 0.6)
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
