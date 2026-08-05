import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { sfx } from '../../audio/engine'

interface PortalProps {
  position: [number, number, number]
  color?: string
  label?: string
  onEnter?: () => void
  rotation?: [number, number, number]
  scale?: number
}

export function Portal({
  position,
  color = '#00d4ff',
  label = 'ENTER',
  onEnter,
  rotation = [0, 0, 0],
  scale = 1,
}: PortalProps) {
  const ring = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ring.current) {
      ring.current.rotation.z = t * 0.5
      const s = scale * (1 + Math.sin(t * 2) * 0.05)
      ring.current.scale.set(s, s, s)
    }
    if (inner.current) {
      inner.current.rotation.z = -t * 0.8
      ;(inner.current.material as THREE.MeshBasicMaterial).opacity =
        0.6 + Math.sin(t * 3) * 0.2
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Frame arch (torus) */}
      <mesh
        ref={ring}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          sfx.warp(1.2)
          sfx.whoosh(1.0)
          onEnter?.()
        }}
      >
        <torusGeometry args={[2.2, 0.18, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 3 : 1.5}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
      {/* Swirling inner */}
      <mesh ref={inner}>
        <circleGeometry args={[2, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Glow sprite */}
      <pointLight color={color} intensity={hovered ? 8 : 4} distance={12} />
      {hovered && (
        <Html center position={[0, 2.8, 0]} distanceFactor={8}>
          <div className="portal-label">{label}</div>
        </Html>
      )}
    </group>
  )
}
