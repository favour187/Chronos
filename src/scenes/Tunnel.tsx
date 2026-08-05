// Warp through a tunnel of light rings toward the next era (with AI-generated warp backdrop)
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useGame } from '../store/game'
import { sfx } from '../audio/engine'

export function Tunnel() {
  const goToEra = useGame((s) => s.goToEra)
  const eraIndex = useGame((s) => s.currentEraIndex)

  useEffect(() => {
    sfx.warp(2.5)
    const t = window.setTimeout(() => goToEra(eraIndex), 2400)
    return () => window.clearTimeout(t)
  }, [eraIndex, goToEra])

  return (
    <div className="tunnel-wrap">
      <Canvas camera={{ position: [0, 0, 0], fov: 90 }} dpr={[1, 2]}>
        <TunnelFX />
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={1.4} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.1} darkness={0.9} />
        </EffectComposer>
      </Canvas>
      <div className="tunnel-label">
        <div className="tunnel-warp">WARPING THROUGH TIME…</div>
      </div>
    </div>
  )
}

function TunnelFX() {
  const group = useRef<THREE.Group>(null)
  const rings = useRef<THREE.Mesh[]>([])
  const stars = useRef<THREE.Points>(null)

  const warpTex = useLoader(THREE.TextureLoader, '/images/tunnel-warp.jpg')
  useEffect(() => {
    if (warpTex) warpTex.colorSpace = THREE.SRGBColorSpace
  }, [warpTex])

  const starPositions = useMemo(() => {
    const n = 1500
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30
      arr[i * 3 + 2] = (Math.random() - 0.5) * 120
    }
    return arr
  }, [])

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()
    if (group.current) group.current.rotation.z = t * 0.4
    rings.current.forEach((r, i) => {
      const z = ((i * 4 - t * 55) % 160) - 80
      r.position.z = z
      const s = THREE.MathUtils.mapLinear(z, -80, 80, 0.2, 5)
      r.scale.setScalar(s)
      const mat = r.material as THREE.MeshBasicMaterial
      mat.opacity = THREE.MathUtils.mapLinear(z, -80, 80, 0.05, 0.9)
      mat.color.setHSL((i * 0.08 + t * 0.3) % 1, 0.9, 0.6)
    })
    if (stars.current) {
      stars.current.rotation.z = t * 0.1
      const pos = stars.current.geometry.attributes.position as THREE.BufferAttribute
      const arr = pos.array as Float32Array
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 2] -= 1.2
        if (arr[i + 2] < -80) arr[i + 2] = 80
      }
      pos.needsUpdate = true
    }
    const persp = camera as THREE.PerspectiveCamera
    persp.fov = 90 + Math.sin(t * 8) * 8
    persp.updateProjectionMatrix()
  })

  return (
    <group>
      {/* AI-generated warp backdrop on a large sphere behind the rings */}
      <mesh scale={[600, 600, 600]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial map={warpTex} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <color attach="background" args={['#000']} />
      <pointLight color="#00d4ff" intensity={4} distance={40} />
      <pointLight color="#c470ff" intensity={4} distance={40} position={[2, 2, -5]} />
      <group ref={group}>
        {Array.from({ length: 40 }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) rings.current[i] = el
            }}
          >
            <torusGeometry args={[3, 0.06, 8, 96]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <points ref={stars}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#ffffff" sizeAttenuation transparent opacity={0.9} />
      </points>
    </group>
  )
}
