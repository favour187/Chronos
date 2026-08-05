// Era scenes are built from AI-generated images mapped to a sky sphere,
// with subtle era-appropriate 3D accents layered in front. This keeps the
// visual hero as real AI art while still feeling alive and interactive.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ImageBackdrop } from '../components/scene/ImageBackdrop'
import { Particles } from '../components/scene/Particles'
import { ERAS } from '../eras/data'

interface Props {
  eraId: string
  accent: string
}

export function EraWorld({ eraId, accent }: Props) {
  const era = ERAS.find((e) => e.id === eraId)
  const img = era?.image ?? `/images/${eraId}.jpg`
  return (
    <group>
      <ImageBackdrop src={img} darkness={0.05} tint="#ffffff" parallax={0.15} drift={0.002} />
      <GroundFog accent={accent} />
      <EraAccents eraId={eraId} accent={accent} />
    </group>
  )
}


/* A soft dark vignette ground plane */
function GroundFog({ accent }: { accent: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const m = ref.current.material as THREE.MeshBasicMaterial
    m.opacity = 0.45 + Math.sin(clock.elapsedTime * 0.8) * 0.05
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} renderOrder={-100}>
      <circleGeometry args={[80, 64]} />
      <meshBasicMaterial
        color={accent}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </mesh>
  )
}

/* Small era-flavored 3D accents that float in front of the AI image */
function EraAccents({ eraId, accent }: { eraId: string; accent: string }) {
  switch (eraId) {
    case 'birth-of-earth':
      return (
        <>
          <FloatingRock color="#ff5a1f" position={[-6, 3, -8]} speed={0.3} />
          <FloatingRock color="#ffb347" position={[5, 4, -10]} speed={-0.25} size={1.2} />
          <Particles count={200} color="#ff6a00" size={0.12} radius={14} shape="dust" speed={0.4} />
          <Lightning />
        </>
      )
    case 'dinosaur-age':
      return (
        <>
          <SwayingFern position={[-4, 0, -6]} />
          <SwayingFern position={[5, 0, -8]} scale={1.3} />
          <Particles count={300} color={accent} size={0.08} radius={12} shape="dust" speed={0.1} />
          <Fireflies color="#aaff88" />
        </>
      )
    case 'early-humans':
      return (
        <>
          <Campfire position={[0, 0, -4]} />
          <Particles count={250} color="#ff8a3c" size={0.1} radius={10} shape="dust" speed={0.25} />
          <Fireflies color="#ffc088" />
        </>
      )
    case 'ancient-egypt':
      return (
        <>
          <SandParticles />
          <SunGlow color="#ffd54a" position={[-10, 6, -20]} />
        </>
      )
    case 'ancient-greece':
      return (
        <>
          <MarbleColumn position={[-3, 0, -5]} />
          <MarbleColumn position={[3, 0, -5]} />
          <Particles count={200} color={accent} size={0.06} radius={10} shape="dust" speed={0.08} />
        </>
      )
    case 'roman-empire':
      return (
        <>
          <MarbleColumn position={[-3, 0, -5]} color="#b08666" />
          <MarbleColumn position={[3, 0, -5]} color="#b08666" />
          <Particles count={200} color={accent} size={0.07} radius={10} shape="dust" speed={0.1} />
        </>
      )
    case 'medieval':
      return (
        <>
          <Torch position={[-3, 1.5, -5]} />
          <Torch position={[3, 1.5, -5]} />
          <Fireflies color="#ffc488" />
          <Particles count={200} color={accent} size={0.07} radius={12} shape="dust" speed={0.1} />
        </>
      )
    case 'renaissance':
      return (
        <>
          <FloatingOrbit color="#e6a366" position={[0, 3, -8]} />
          <Particles count={200} color={accent} size={0.06} radius={10} shape="dust" speed={0.08} />
        </>
      )
    case 'industrial':
      return (
        <>
          <Smoke />
          <Particles count={250} color="#cfdde0" size={0.08} radius={12} shape="dust" speed={0.2} />
        </>
      )
    case 'digital':
      return (
        <>
          <FloatingOrbit color={accent} position={[-4, 2.5, -8]} />
          <FloatingOrbit color="#00d4ff" position={[5, 3, -10]} size={0.8} />
          <BinaryRain />
          <Particles count={400} color={accent} size={0.08} radius={14} shape="dust" speed={0.3} />
        </>
      )
    case 'future':
      return (
        <>
          <FloatingOrbit color={accent} position={[-5, 4, -10]} />
          <FloatingOrbit color="#c490ff" position={[6, 5, -12]} size={0.8} />
          <Particles count={400} color={accent} size={0.06} radius={14} shape="sphere" speed={0.2} />
        </>
      )
    case 'cosmic':
      return (
        <>
          <NebulaParticles />
          <Particles count={1000} color="#ffffff" size={0.05} radius={40} shape="sphere" speed={0.02} />
        </>
      )
    default:
      return <Particles count={200} color={accent} size={0.06} radius={10} shape="dust" speed={0.1} />
  }
}

/* ---------- Reusable micro-accents ---------- */

function FloatingRock({
  position,
  color,
  speed = 0.3,
  size = 1,
}: {
  position: [number, number, number]
  color: string
  speed?: number
  size?: number
}) {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!g.current) return
    const t = clock.getElapsedTime()
    g.current.position.y = position[1] + Math.sin(t * speed) * 0.6
    g.current.rotation.y = t * speed
    g.current.rotation.x = t * speed * 0.3
  })
  return (
    <group ref={g} position={position} scale={size}>
      <mesh>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={1} />
      </mesh>
      <pointLight color={color} intensity={1.5} distance={8} />
    </group>
  )
}

function Lightning() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(() => {
    if (!ref.current) return
    const flash = Math.random() > 0.995 ? 6 : Math.max(0, ref.current.intensity - 0.2)
    ref.current.intensity = flash
  })
  return <pointLight ref={ref} color="#ffffff" intensity={0} distance={60} position={[0, 20, -20]} />
}

function SwayingFern({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!g.current) return
    g.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.2) * 0.05
  })
  return (
    <group ref={g} position={position} scale={scale}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 1.6, 6]} />
        <meshStandardMaterial color="#3a2410" roughness={1} />
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <coneGeometry args={[1, 2.2, 8]} />
        <meshStandardMaterial color="#2e8535" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Fireflies({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useRef<Float32Array>()
  if (!positions.current) {
    const n = 120
    const a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 20
      a[i * 3 + 1] = Math.random() * 6
      a[i * 3 + 2] = -Math.random() * 15
    }
    positions.current = a
  }
  useFrame(({ clock }) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    const t = clock.getElapsedTime()
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += Math.sin(t + i) * 0.01
      arr[i] += Math.cos(t * 0.7 + i) * 0.01
    }
    pos.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color={color} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  )
}

function Campfire({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) ref.current.scale.y = 1 + Math.sin(t * 8) * 0.2
    if (light.current) light.current.intensity = 4 + Math.sin(t * 10) * 1.2
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1, 1.2, 0.2, 8]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
      <mesh ref={ref} position={[0, 0.7, 0]}>
        <coneGeometry args={[0.6, 1.4, 8]} />
        <meshStandardMaterial color="#ffb066" emissive="#ff6a00" emissiveIntensity={2.5} transparent opacity={0.95} />
      </mesh>
      <pointLight ref={light} color="#ff8833" intensity={4} distance={20} position={[0, 1.5, 0]} />
    </group>
  )
}

function SandParticles() {
  return <Particles count={400} color="#e6c98f" size={0.05} radius={20} shape="dust" speed={0.4} />
}

function SunGlow({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <pointLight color={color} intensity={6} distance={60} />
    </group>
  )
}

function MarbleColumn({ position, color = '#ece3cc' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 5, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 5.1, 0]}>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

function Torch({ position }: { position: [number, number, number] }) {
  const flame = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (flame.current) flame.current.scale.y = 1 + Math.sin(t * 12) * 0.25
    if (light.current) light.current.intensity = 2 + Math.sin(t * 12) * 0.8
  })
  return (
    <group position={position}>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.2, 6]} />
        <meshStandardMaterial color="#2a1810" />
      </mesh>
      <mesh ref={flame} position={[0, 0.2, 0]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshStandardMaterial color="#ffcc66" emissive="#ff7722" emissiveIntensity={3} />
      </mesh>
      <pointLight ref={light} color="#ff9933" intensity={2} distance={10} />
    </group>
  )
}

function FloatingOrbit({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!g.current) return
    const t = clock.getElapsedTime()
    g.current.rotation.y = t * 0.6
    g.current.rotation.x = Math.sin(t * 0.8) * 0.4
  })
  return (
    <group ref={g} position={position} scale={size}>
      <mesh>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 8, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <pointLight color={color} intensity={2} distance={10} />
    </group>
  )
}

function Smoke() {
  const ref = useRef<THREE.Group>(null)
  const parts = Array.from({ length: 30 }, () => ({
    x: (Math.random() - 0.5) * 20,
    z: -6 - Math.random() * 14,
    off: Math.random() * 3,
  }))
  useFrame(({ clock }) => {
    ref.current?.children.forEach((c, i) => {
      const p = parts[i]
      if (!p) return
      const t = (clock.getElapsedTime() + p.off) % 4
      c.position.set(p.x, t * 2, p.z)
      c.scale.setScalar(0.5 + t)
      const mat = (c as THREE.Mesh).material
      if (mat) (mat as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.4 - t * 0.1)
    })
  })
  return (
    <group ref={ref}>
      {parts.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial color="#666" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function BinaryRain() {
  const ref = useRef<THREE.Points>(null)
  const positions = useRef<Float32Array>()
  if (!positions.current) {
    const n = 400
    const a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 40
      a[i * 3 + 1] = Math.random() * 15
      a[i * 3 + 2] = -2 - Math.random() * 20
    }
    positions.current = a
  }
  useFrame((_, dt) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] -= dt * 5
      if (arr[i + 1] < 0) arr[i + 1] = 15
    }
    pos.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#3effa0" sizeAttenuation transparent opacity={0.7} />
    </points>
  )
}

function NebulaParticles() {
  return (
    <>
      {[
        { p: [-15, 6, -25] as [number, number, number], c: '#c470ff', s: 8 },
        { p: [18, 4, -20] as [number, number, number], c: '#5ee5ff', s: 6 },
        { p: [0, -3, -30] as [number, number, number], c: '#ff6ac1', s: 10 },
        { p: [-10, -5, -22] as [number, number, number], c: '#ffd700', s: 5 },
      ].map((n, i) => (
        <mesh key={i} position={n.p}>
          <sphereGeometry args={[n.s, 20, 20]} />
          <meshStandardMaterial color={n.c} transparent opacity={0.2} depthWrite={false} emissive={n.c} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </>
  )
}
