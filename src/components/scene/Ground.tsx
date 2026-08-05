import * as THREE from 'three'
import { useMemo } from 'react'

interface GroundProps {
  color: string
  accent: string
  size?: number
}

export function Ground({ color, accent, size = 80 }: GroundProps) {
  const gridTex = useMemo(() => makeGridTexture(accent), [accent])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={0.95}
          metalness={0.1}
          emissive={new THREE.Color(accent).multiplyScalar(0.08)}
        />
      </mesh>
      {/* Grid glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0.02]} position={[0, 0.01, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial
          map={gridTex}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function makeGridTexture(accent: string): THREE.Texture {
  const size = 512
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = accent
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 1
  const step = 32
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, x)
    ctx.lineTo(size, x)
    ctx.stroke()
  }
  // radiant center
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, accent + 'cc')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalAlpha = 0.25
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  return tex
}
