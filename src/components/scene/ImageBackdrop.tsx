import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'

interface ImageBackdropProps {
  src: string
  darkness?: number
  zoom?: number
}

/**
 * Cinematic flat backdrop: the AI image is projected on a huge plane behind
 * everything, sized to exactly fill the camera frustum. No sphere distortion
 * on phones — image looks like a perfectly framed poster / standby screen.
 */
export function ImageBackdrop({ src, darkness = 0, zoom = 1 }: ImageBackdropProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const { size, camera } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const texture = useLoader(THREE.TextureLoader, src)

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 8
    }
  }, [texture])

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  useFrame(() => {
    if (!mesh.current) return
    const distance = 18
    const vFov = (cam.fov * Math.PI) / 180
    const h = 2 * Math.tan(vFov / 2) * distance * zoom
    const w = h * Math.max(0.6, size.width / size.height)
    mesh.current.scale.set(w, h, 1)
    mesh.current.position.set(0, 1.6, -distance)
    // Always face camera
    mesh.current.quaternion.copy(cam.quaternion)
  })

  return (
    <mesh ref={mesh} geometry={geometry} renderOrder={-1000}>
      <meshBasicMaterial
        map={texture}
        toneMapped
        transparent={darkness > 0}
        opacity={1 - darkness}
        depthWrite={false}
      />
    </mesh>
  )
}
