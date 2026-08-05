// Warp through a tunnel of light rings toward the next era
import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../store/game'
import { sfx } from '../audio/engine'

export function Tunnel() {
  const goToEra = useGame((s) => s.goToEra)
  const eraIndex = useGame((s) => s.currentEraIndex)

  useEffect(() => {
    sfx.warp(2.2)
    const t = window.setTimeout(() => goToEra(eraIndex), 2400)
    return () => window.clearTimeout(t)
  }, [eraIndex, goToEra])

  return (
    <div className="tunnel-wrap">
      <Canvas camera={{ position: [0, 0, 0], fov: 80 }} dpr={[1, 2]}>
        <color attach="background" args={['#000']} />
        <TunnelFX />
      </Canvas>
      <div className="tunnel-label">
        <div className="tunnel-year" />
        <div className="tunnel-warp">WARPING THROUGH TIME\u2026</div>
      </div>
    </div>
  )
}

function TunnelFX() {
  const group = useRef<THREE.Group>(null)
  const rings = useRef<THREE.Mesh[]>([])
  const stars = useRef<THREE.Points>(null)

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()
    if (group.current) group.current.rotation.z = t * 0.4
    rings.current.forEach((r, i) => {
      const z = ((i * 4 - t * 40) % 120) - 60
      r.position.z = z
      const s = THREE.MathUtils.mapLinear(z, -60, 60, 0.3, 4)
      r.scale.setScalar(s)
      const mat = r.material as THREE.MeshBasicMaterial
      mat.opacity = THREE.MathUtils.mapLinear(z, -60, 60, 0.05, 0.8)
      mat.color.setHSL((i * 0.08 + t * 0.2) % 1, 0.8, 0.6)
    })
    if (stars.current) {
      stars.current.rotation.z = t * 0.1
      const pos = stars.current.geometry.attributes.position as THREE.BufferAttribute
      const arr = pos.array as Float32Array
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 2] -= 0.8
        if (arr[i + 2] < -60) arr[i + 2] = 60
      }
      pos.needsUpdate = true
    }
    const persp = camera as THREE.PerspectiveCamera
    persp.fov = 80 + Math.sin(t * 6) * 5
    persp.updateProjectionMatrix()
  })

  const starPositions = useRef<Float32Array>()
  if (!starPositions.current) {
    const n = 1500
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30
      arr[i * 3 + 2] = (Math.random() - 0.5) * 120
    }
    starPositions.current = arr
  }

  return (
    <group ref={group}>
      <pointLight color="#00d4ff" intensity={3} distance={20} />
      <pointLight color="#c470ff" intensity={3} distance={20} position={[2, 2, -5]} />
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) rings.current[i] = el
          }}
        >
          <torusGeometry args={[3, 0.04, 8, 64]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <points ref={stars}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions.current, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#ffffff" sizeAttenuation transparent opacity={0.9} />
      </points>
    </group>
  )
}
