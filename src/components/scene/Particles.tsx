import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticlesProps {
  count?: number
  color?: string
  size?: number
  radius?: number
  speed?: number
  shape?: 'sphere' | 'dust' | 'ring'
  scale?: [number, number, number]
}

export function Particles({
  count = 600,
  color = '#ffffff',
  size = 0.05,
  radius = 30,
  speed = 0.05,
  shape = 'sphere',
  scale = [1, 1, 1],
}: ParticlesProps) {
  const mesh = useRef<THREE.Points>(null)
  const material = useRef<THREE.PointsMaterial>(null)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      let x: number, y: number, z: number
      if (shape === 'sphere') {
        const r = radius * (0.3 + Math.random() * 0.9)
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        x = r * Math.sin(phi) * Math.cos(theta)
        y = r * Math.sin(phi) * Math.sin(theta)
        z = r * Math.cos(phi)
      } else if (shape === 'dust') {
        x = (Math.random() - 0.5) * radius * 4
        y = Math.random() * radius * 1.5
        z = (Math.random() - 0.5) * radius * 4
      } else {
        const a = Math.random() * Math.PI * 2
        const r = radius * (0.7 + Math.random() * 0.4)
        x = Math.cos(a) * r
        y = (Math.random() - 0.5) * 0.5
        z = Math.sin(a) * r
      }
      positions[i * 3] = x * scale[0]
      positions[i * 3 + 1] = y * scale[1]
      positions[i * 3 + 2] = z * scale[2]
      velocities[i * 3] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 1] = (Math.random() - 0.2) * speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed
    }
    return { positions, velocities }
  }, [count, radius, shape, scale, speed])

  useFrame((_, dt) => {
    if (!mesh.current) return
    const g = mesh.current.geometry
    const pos = g.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3] * dt
      arr[i * 3 + 1] += velocities[i * 3 + 1] * dt
      arr[i * 3 + 2] += velocities[i * 3 + 2] * dt
      // Wrap
      for (let ax = 0; ax < 3; ax++) {
        const lim = radius * (ax === 1 ? 0.8 : 2) * scale[ax]
        if (arr[i * 3 + ax] > lim) arr[i * 3 + ax] -= lim * 2
        if (arr[i * 3 + ax] < -lim) arr[i * 3 + ax] += lim * 2
      }
    }
    pos.needsUpdate = true
    if (material.current) {
      material.current.size = size * (1 + Math.sin(performance.now() * 0.002) * 0.2)
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        size={size}
        color={color}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
