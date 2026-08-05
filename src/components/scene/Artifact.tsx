import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../../store/game'
import { sfx } from '../../audio/engine'
import type { EraDef } from '../../eras/data'

interface ArtifactProps {
  era: EraDef
  position: [number, number, number]
}

export function Artifact({ era, position }: ArtifactProps) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const collected = useGame((s) => s.collected.has(era.id))
  const collect = useGame((s) => s.collectArtifact)
  const seen = useGame((s) => s.artifactsSeen.has(era.id))
  const markSeen = () => {
    // no direct action - visibility glow already handled
    void seen
  }
  useEffect(markSeen, [seen])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (group.current) {
      group.current.rotation.y = t * 0.8
      group.current.position.y = position[1] + Math.sin(t * 1.6) * 0.25
    }
    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.5 + Math.sin(t * 3) * 0.7
    }
  })

  if (collected) {
    return (
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color={era.artifact.glow} transparent opacity={0.2} />
        </mesh>
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.25}
          color={era.artifact.glow}
          anchorX="center"
          anchorY="middle"
        >
          COLLECTED
        </Text>
      </group>
    )
  }

  return (
    <group ref={group} position={position}>
      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.02, 8, 48]} />
        <meshBasicMaterial color={era.artifact.glow} transparent opacity={0.8} />
      </mesh>
      {/* Core crystal */}
      <mesh
        ref={core}
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
          sfx.chime()
          collect(era.id)
        }}
      >
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color={era.artifact.glow}
          emissive={era.artifact.glow}
          emissiveIntensity={2}
          metalness={0.5}
          roughness={0.2}
          transparent
          opacity={hovered ? 1 : 0.9}
        />
      </mesh>
      <pointLight color={era.artifact.glow} intensity={4} distance={8} />
      {hovered && (
        <Html center position={[0, 1.1, 0]} distanceFactor={8}>
          <div className="artifact-prompt">
            <span className="artifact-emoji">{era.artifact.emoji}</span>
            <span>{era.artifact.name}</span>
            <span className="artifact-prompt-cta">Click to collect</span>
          </div>
        </Html>
      )}
    </group>
  )
}
