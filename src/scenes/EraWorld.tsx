// Procedural environment per era. All geometry is generated at runtime (no GLTF assets needed).
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  eraId: string
  accent: string
}

export function EraWorld({ eraId, accent }: Props) {
  switch (eraId) {
    case 'birth-of-earth':
      return <BirthOfEarth accent={accent} />
    case 'dinosaur-age':
      return <DinosaurAge accent={accent} />
    case 'early-humans':
      return <EarlyHumans accent={accent} />
    case 'ancient-egypt':
      return <AncientEgypt accent={accent} />
    case 'ancient-greece':
      return <AncientGreece accent={accent} />
    case 'roman-empire':
      return <RomanEmpire accent={accent} />
    case 'medieval':
      return <Medieval accent={accent} />
    case 'renaissance':
      return <Renaissance accent={accent} />
    case 'industrial':
      return <Industrial accent={accent} />
    case 'digital':
      return <Digital accent={accent} />
    case 'future':
      return <Future accent={accent} />
    case 'cosmic':
      return <Cosmic accent={accent} />
    default:
      return null
  }
}

/* ------------ Reusable building blocks ------------ */

function Volcano({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2, 0]}>
        <coneGeometry args={[3, 5, 16, 1, true]} />
        <meshStandardMaterial color="#2a0f00" roughness={1} />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[0.6, 1.2, 16]} />
        <meshStandardMaterial color="#ff7a2a" emissive="#ff4500" emissiveIntensity={2} />
        <pointLight color="#ff5500" intensity={4} distance={18} position={[0, 5, 0]} />
      </mesh>
    </group>
  )
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.6, 8]} />
        <meshStandardMaterial color="#4a2a10" roughness={1} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[1.2, 2.4, 8]} />
        <meshStandardMaterial color="#1f6b1f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.0, 0]} castShadow>
        <coneGeometry args={[0.9, 1.8, 8]} />
        <meshStandardMaterial color="#2a8a2a" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Building({
  position,
  size,
  color,
  emissive,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  emissive?: string
}) {
  return (
    <mesh position={[position[0], position[1] + size[1] / 2, position[2]]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        emissive={emissive ?? '#000'}
        emissiveIntensity={emissive ? 0.6 : 0}
      />
    </mesh>
  )
}

function Column({ position, height = 5, color = '#e8e2d0' }: { position: [number, number, number]; height?: number; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, height, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, height + 0.15, 0]} castShadow>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

function Spinning({ children, speed = 0.3, axis = 'y' }: { children: React.ReactNode; speed?: number; axis?: 'x' | 'y' | 'z' }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    if (axis === 'y') ref.current.rotation.y += dt * speed
    if (axis === 'x') ref.current.rotation.x += dt * speed
    if (axis === 'z') ref.current.rotation.z += dt * speed
  })
  return <group ref={ref}>{children}</group>
}

/* ------------ Worlds ------------ */

function BirthOfEarth({ accent }: { accent: string }) {
  const lava = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (lava.current) {
      const m = lava.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.2 + Math.sin(clock.elapsedTime * 2) * 0.4
    }
  })
  return (
    <group>
      {/* Flowing lava rivers */}
      <mesh ref={lava} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60, 32, 32]} />
        <meshStandardMaterial color="#3a0f00" emissive={accent} emissiveIntensity={1.5} roughness={0.5} />
      </mesh>
      <Volcano position={[-14, 0, -8]} scale={1.5} />
      <Volcano position={[12, 0, -10]} scale={1.2} />
      <Volcano position={[6, 0, -20]} scale={1.0} />
      {/* Asteroids in sky */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Spinning key={i} speed={0.4} axis="y">
          <mesh position={[(i - 4) * 6, 12 + (i % 3) * 2, -20 - i * 2]}>
            <dodecahedronGeometry args={[0.6 + (i % 3) * 0.3, 0]} />
            <meshStandardMaterial color="#6b3a1a" roughness={1} />
          </mesh>
        </Spinning>
      ))}
      <pointLight color="#ff5500" intensity={8} distance={80} position={[0, 10, -20]} />
    </group>
  )
}

function DinosaurAge({ accent }: { accent: string }) {
  void accent
  return (
    <group>
      {/* Jungle trees */}
      {Array.from({ length: 24 }).map((_, i) => (
        <Tree
          key={i}
          position={[
            (Math.random() - 0.5) * 40,
            0,
            -4 - Math.random() * 24,
          ]}
          scale={0.8 + Math.random() * 0.8}
        />
      ))}
      {/* Fern ground scatter */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 40, 0.2, -Math.random() * 30]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
          <circleGeometry args={[0.4, 6]} />
          <meshStandardMaterial color="#2a6b2a" roughness={1} />
        </mesh>
      ))}
      {/* Simple dino (brontosaurus-ish) */}
      <group position={[-6, 0, -12]} scale={1.4}>
        <mesh position={[0, 2, 0]} castShadow>
          <capsuleGeometry args={[0.8, 3, 8, 16]} />
          <meshStandardMaterial color="#3b6b2a" roughness={0.9} />
        </mesh>
        <mesh position={[2, 3.4, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.35, 2.4, 8]} />
          <meshStandardMaterial color="#3b6b2a" roughness={0.9} />
        </mesh>
        <mesh position={[2.6, 4.5, 0]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#3b6b2a" roughness={0.9} />
        </mesh>
        {[[-1.2, 1], [-0.4, 1], [0.4, 1], [1.2, 1]].map((p, i) => (
          <mesh key={i} position={[p[0], 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 1.4, 6]} />
            <meshStandardMaterial color="#2c5220" roughness={1} />
          </mesh>
        ))}
        {/* Tail */}
        <mesh position={[-2.6, 2, 0]} rotation={[0, 0, 0.3]} castShadow>
          <coneGeometry args={[0.35, 2.4, 8]} />
          <meshStandardMaterial color="#3b6b2a" roughness={0.9} />
        </mesh>
      </group>
      <Volcano position={[18, 0, -22]} scale={1.8} />
      {/* Meteor in sky */}
      <Spinning speed={0.8}>
        <mesh position={[10, 14, -28]}>
          <icosahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial color="#553322" emissive="#ff6a00" emissiveIntensity={0.6} />
        </mesh>
      </Spinning>
    </group>
  )
}

function EarlyHumans({ accent }: { accent: string }) {
  void accent
  return (
    <group>
      {/* Cave */}
      <mesh position={[-8, 2.5, -12]}>
        <dodecahedronGeometry args={[6, 0]} />
        <meshStandardMaterial color="#1a1108" roughness={1} />
      </mesh>
      <mesh position={[-8, 1, -7]} rotation={[0, 0, 0]}>
        <torusGeometry args={[2, 0.8, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#0a0806" roughness={1} />
      </mesh>
      {/* Campfire */}
      <group position={[0, 0, -6]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1.2, 1.4, 0.2, 16]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <coneGeometry args={[0.6, 1.4, 8]} />
          <meshStandardMaterial color="#ffb066" emissive="#ff6a00" emissiveIntensity={2} transparent opacity={0.9} />
        </mesh>
        <pointLight color="#ff8833" intensity={6} distance={18} position={[0, 1.5, 0]} />
      </group>
      {/* Rocks / logs */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 16, 0.2, -4 - Math.random() * 8]} rotation={[0, Math.random(), 0]}>
          <cylinderGeometry args={[0.3, 0.4, 1.6, 6]} />
          <meshStandardMaterial color="#3a2a1a" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function AncientEgypt({ accent }: { accent: string }) {
  return (
    <group>
      {/* Pyramids */}
      <Pyramid position={[-10, 0, -18]} scale={3.5} />
      <Pyramid position={[-2, 0, -22]} scale={2.8} />
      <Pyramid position={[6, 0, -18]} scale={2.2} />
      {/* Sphinx-ish */}
      <group position={[-5, 0, -10]}>
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[3, 1.5, 5]} />
          <meshStandardMaterial color="#c9a870" roughness={1} />
        </mesh>
        <mesh position={[0, 2.2, 2]} castShadow>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#c9a870" roughness={1} />
        </mesh>
      </group>
      {/* Sand dunes */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[(i - 10) * 4, -0.3, -12 - Math.random() * 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3 + Math.random() * 2, 16]} />
          <meshStandardMaterial color="#b89060" roughness={1} />
        </mesh>
      ))}
      <pointLight color={accent} intensity={2} distance={40} position={[0, 10, -20]} />
    </group>
  )
}

function Pyramid({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <coneGeometry args={[2, 2.8, 4]} />
        <meshStandardMaterial color="#d9b272" roughness={1} />
      </mesh>
      <mesh position={[0, 2.85, 0]}>
        <coneGeometry args={[0.2, 0.3, 4]} />
        <meshStandardMaterial color="#ffd54a" emissive="#ffd54a" emissiveIntensity={1} />
      </mesh>
    </group>
  )
}

function AncientGreece({ accent }: { accent: string }) {
  return (
    <group>
      {/* Parthenon base + columns */}
      <mesh position={[0, 0.3, -14]} receiveShadow castShadow>
        <boxGeometry args={[14, 0.6, 8]} />
        <meshStandardMaterial color="#e8e2d0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5.3, -14]} castShadow>
        <boxGeometry args={[14, 0.6, 8]} />
        <meshStandardMaterial color="#e8e2d0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5.9, -14]} castShadow>
        <boxGeometry args={[15, 0.8, 9]} />
        <meshStandardMaterial color="#d6cfba" roughness={0.9} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <Column key={'f' + i} position={[-6 + i * 2, 0.6, -10.2]} height={4.5} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <Column key={'b' + i} position={[-6 + i * 2, 0.6, -17.8]} height={4.5} />
      ))}
      {/* Statue */}
      <mesh position={[0, 3, -14]}>
        <cylinderGeometry args={[0.6, 0.8, 4, 12]} />
        <meshStandardMaterial color="#f0ead6" roughness={0.9} />
      </mesh>
      <pointLight color={accent} intensity={2} distance={30} position={[0, 8, -14]} />
    </group>
  )
}

function RomanEmpire({ accent }: { accent: string }) {
  return (
    <group>
      {/* Colosseum arcs */}
      <group position={[0, 0, -18]}>
        <mesh position={[0, 3, 0]} castShadow>
          <torusGeometry args={[10, 2.5, 8, 32, Math.PI * 1.6]} />
          <meshStandardMaterial color="#8a6040" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <circleGeometry args={[7.6, 32]} />
          <meshStandardMaterial color="#c9a27a" roughness={1} />
        </mesh>
      </group>
      {/* Aqueduct */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Column key={i} position={[-20 + i * 3, 0, -2 - i]} height={6} color="#a88a60" />
      ))}
      <mesh position={[-12.5, 6.2, -4.5]}>
        <boxGeometry args={[18, 0.5, 1.5]} />
        <meshStandardMaterial color="#a88a60" roughness={1} />
      </mesh>
      {/* Road */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 40]} />
        <meshStandardMaterial color="#6b5840" roughness={1} />
      </mesh>
      <pointLight color={accent} intensity={2} distance={40} position={[0, 8, -18]} />
    </group>
  )
}

function Medieval({ accent }: { accent: string }) {
  return (
    <group>
      {/* Castle */}
      <Building position={[-6, 0, -18]} size={[8, 4, 6]} color="#6b6a66" />
      <Building position={[-10.5, 0, -15]} size={[2, 8, 2]} color="#585753" />
      <Building position={[-1.5, 0, -15]} size={[2, 8, 2]} color="#585753" />
      <Building position={[-10.5, 0, -21]} size={[2, 8, 2]} color="#585753" />
      <Building position={[-1.5, 0, -21]} size={[2, 8, 2]} color="#585753" />
      <Building position={[-6, 0, -21]} size={[4, 3, 0.5]} color="#3c2a1a" />
      {/* Flags */}
      <mesh position={[-10.5, 8.6, -15]}>
        <boxGeometry args={[0.05, 1, 0.05]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-10, 8.7, -15]}>
        <planeGeometry args={[0.8, 0.5]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Village huts */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} position={[10 + (i % 3) * 3, 0, -8 - (i % 2) * 4]}>
          <Building position={[0, 0, 0]} size={[2, 1.4, 2]} color="#7a5838" />
          <mesh position={[0, 1.7, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.7, 1, 4]} />
            <meshStandardMaterial color="#a04020" roughness={1} />
          </mesh>
        </group>
      ))}
      {/* Dragon (fantasy) */}
      <Spinning speed={0.3}>
        <group position={[6, 9, -22]}>
          <mesh>
            <capsuleGeometry args={[0.4, 1.5, 6, 12]} />
            <meshStandardMaterial color="#2a1a2a" roughness={0.8} emissive="#d64545" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[1.2, 0.2, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.8, 0.05, 4]} />
            <meshBasicMaterial color={accent} />
          </mesh>
        </group>
      </Spinning>
      {Array.from({ length: 12 }).map((_, i) => (
        <Tree key={i} position={[-14 - i * 2, 0, -4 - i]} scale={0.9} />
      ))}
    </group>
  )
}

function Renaissance({ accent }: { accent: string }) {
  return (
    <group>
      {/* Dome church */}
      <Building position={[0, 0, -16]} size={[10, 4, 8]} color="#e6d6b8" />
      <mesh position={[0, 7, -16]}>
        <sphereGeometry args={[2.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c97b4a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 9, -16]}>
        <cylinderGeometry args={[0.2, 0.2, 1.6, 8]} />
        <meshStandardMaterial color="#c97b4a" />
      </mesh>
      {/* Workshop building */}
      <Building position={[-10, 0, -8]} size={[6, 3, 4]} color="#d6b690" />
      <Building position={[10, 0, -8]} size={[6, 3, 4]} color="#d6b690" />
      {/* Flying machine model */}
      <Spinning speed={0.5}>
        <group position={[0, 8, -6]}>
          <mesh>
            <capsuleGeometry args={[0.2, 1.2, 6, 8]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[4, 0.05, 0.8]} />
            <meshStandardMaterial color="#d6c08a" side={THREE.DoubleSide} />
          </mesh>
        </group>
      </Spinning>
      <pointLight color={accent} intensity={2} distance={25} position={[0, 6, -10]} />
    </group>
  )
}

function Industrial({ accent }: { accent: string }) {
  return (
    <group>
      {/* Factory */}
      <Building position={[-6, 0, -14]} size={[10, 4, 8]} color="#4a4a52" />
      {[[-10, 6, -16], [-6, 6, -16], [-2, 6, -16]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.4, 0.5, 4, 12]} />
          <meshStandardMaterial color="#2a2a30" />
        </mesh>
      ))}
      {/* Smoke */}
      <Smoke />
      {/* Steam locomotive */}
      <group position={[0, 0, 2]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[5, 1.8, 2]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[-1.8, 2, 0]}>
          <cylinderGeometry args={[0.8, 1, 2, 16]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.5} />
        </mesh>
        {[[-1.8, 0.2], [1.8, 0.2]].map((p, i) => (
          <mesh key={i} position={[p[0], p[1], 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
            <meshStandardMaterial color="#111" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
      </group>
      {/* Rails */}
      <mesh position={[0, 0.05, 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[40, 0.1, 3]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <pointLight color={accent} intensity={2} distance={30} position={[0, 6, -14]} />
    </group>
  )
}

function Smoke() {
  const ref = useRef<THREE.Group>(null)
  const particles = Array.from({ length: 40 }, (_, i) => ({
    x: -10 + (i % 3) * 4,
    y: 8,
    z: -16,
    off: Math.random() * 4,
  }))
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.children.forEach((c, i) => {
      const p = particles[i]
      if (!p) return
      const t = (clock.elapsedTime + p.off) % 4
      c.position.set(p.x, p.y + t * 1.5, p.z)
      c.scale.setScalar(0.5 + t * 0.6)
      const mat = (c as THREE.Mesh).material
      if (mat) {
        (mat as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.5 - t * 0.12)
      }
    })
  })
  return (
    <group ref={ref}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshStandardMaterial color="#555" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function Digital({ accent }: { accent: string }) {
  return (
    <group>
      {/* Grid floor with emissive lines */}
      {/* Server towers */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = -12 + (i % 4) * 6
        const z = -6 - Math.floor(i / 4) * 4
        return (
          <Building
            key={i}
            position={[x, 0, z]}
            size={[1.5, 4 + (i % 3), 1.5]}
            color="#0a1a18"
            emissive={accent}
          />
        )
      })}
      {/* Holographic rings */}
      <Spinning speed={0.6}>
        <mesh position={[0, 4, -12]}>
          <torusGeometry args={[3, 0.08, 8, 64]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      </Spinning>
      <Spinning speed={-0.4}>
        <mesh position={[0, 4, -12]} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[4, 0.04, 8, 64]} />
          <meshBasicMaterial color="#00d4ff" />
        </mesh>
      </Spinning>
      {/* Falling binary bits (instanced lines) */}
      <BinaryRain />
      <pointLight color={accent} intensity={4} distance={40} position={[0, 6, -10]} />
    </group>
  )
}

function BinaryRain() {
  const ref = useRef<THREE.Points>(null)
  const positions = useRef<Float32Array>()
  if (!positions.current) {
    const n = 400
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = Math.random() * 20
      arr[i * 3 + 2] = -2 - Math.random() * 20
    }
    positions.current = arr
  }
  useFrame((_, dt) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] -= dt * 4
      if (arr[i + 1] < 0) arr[i + 1] = 20
    }
    pos.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current!, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#3effa0" sizeAttenuation transparent opacity={0.8} />
    </points>
  )
}

function Future({ accent }: { accent: string }) {
  return (
    <group>
      {/* Floating platforms */}
      {[[-8, 4, -10], [0, 6, -16], [8, 5, -10], [-4, 8, -22], [5, 9, -24]].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[2.5, 2.2, 0.5, 16]} />
            <meshStandardMaterial color="#0e3446" metalness={0.6} roughness={0.3} emissive={accent} emissiveIntensity={0.4} />
          </mesh>
          <Building position={[0, 1.2, 0]} size={[1.2, 2.5, 1.2]} color="#0a2030" emissive={accent} />
          <pointLight color={accent} intensity={2} distance={12} position={[0, 2, 0]} />
        </group>
      ))}
      {/* Space elevator tether */}
      <mesh position={[12, 20, -30]}>
        <cylinderGeometry args={[0.08, 0.08, 80, 8]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      {/* Flying vehicles */}
      <Spinning speed={0.4}>
        <mesh position={[-8, 7, -2]}>
          <capsuleGeometry args={[0.3, 1.2, 6, 8]} />
          <meshStandardMaterial color="#b0f0ff" emissive={accent} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
        </mesh>
      </Spinning>
      <pointLight color={accent} intensity={4} distance={50} position={[0, 10, -15]} />
    </group>
  )
}

function Cosmic({ accent }: { accent: string }) {
  return (
    <group>
      {/* Black hole */}
      <group position={[0, 0, -20]}>
        <mesh>
          <sphereGeometry args={[2.5, 48, 48]} />
          <meshBasicMaterial color="#000" />
        </mesh>
        <Spinning speed={0.8}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[4, 0.8, 8, 96]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.5} metalness={0.2} roughness={0.5} />
          </mesh>
        </Spinning>
        <pointLight color={accent} intensity={6} distance={60} />
      </group>
      {/* Nebula blobs */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 20, Math.sin(a) * 8, -18 - Math.random() * 10]}>
            <sphereGeometry args={[2 + Math.random() * 2, 16, 16]} />
            <meshStandardMaterial
              color={['#c470ff', '#5ee5ff', '#ff6ac1', '#ffd700'][i % 4]}
              transparent
              opacity={0.25}
              depthWrite={false}
            />
          </mesh>
        )
      })}
      {/* Stars handled by Particles in parent */}
    </group>
  )
}
