import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'

interface ImageBackdropProps {
  src: string
  /** How much the image drifts with camera (0 = locked, 1 = moves with world) */
  parallax?: number
  /** Darken factor, 0..1 */
  darkness?: number
  /** Color tint */
  tint?: string
  /** Zoom scale */
  zoom?: number
  /** Rotate image slowly */
  drift?: number
}

/**
 * A giant sphere with the AI-generated image mapped to its inside.
 * Used as the primary cinematic environment/skybox for each era.
 * The user's AI art is what you see; three.js adds particles/portals/lights on top.
 */
export function ImageBackdrop({
  src,
  parallax = 0.25,
  darkness = 0,
  tint = '#ffffff',
  zoom = 1,
  drift = 0,
}: ImageBackdropProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  const camStart = useRef(new THREE.Vector3())
  useEffect(() => {
    camStart.current.copy(camera.position)
  }, [src, camera])

  const texture = useLoader(THREE.TextureLoader, src)
  useEffect(() => {
    if (!texture) return
    texture.colorSpace = THREE.SRGBColorSpace
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.anisotropy = 8
  }, [texture])

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
      toneMapped: true,
    })
  }, [])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const offset = new THREE.Vector3().subVectors(camera.position, camStart.current).multiplyScalar(parallax)
    mesh.current.position.copy(offset)
    if (drift) mesh.current.rotation.y = clock.getElapsedTime() * drift
    mesh.current.scale.setScalar(500 * zoom)
    if (material.map !== texture) {
      material.map = texture
      material.color.set(tint)
      material.transparent = darkness > 0
      material.opacity = 1 - darkness
      material.needsUpdate = true
    }
  })

  return (
    <mesh ref={mesh} material={material} renderOrder={-1000}>
      <sphereGeometry args={[1, 64, 32]} />
    </mesh>
  )
}

/** A flat AI image billboard placed in the scene for ground-level hero plates. */
export function ImagePlate({
  src,
  position,
  scale = [30, 18, 1],
  rotation = [0, 0, 0],
  opacity = 1,
}: {
  src: string
  position: [number, number, number]
  scale?: [number, number, number]
  rotation?: [number, number, number]
  opacity?: number
}) {
  const tex = useLoader(THREE.TextureLoader, src)
  useEffect(() => {
    if (tex) tex.colorSpace = THREE.SRGBColorSpace
  }, [tex])
  return (
    <mesh position={position} rotation={rotation} renderOrder={-500}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} toneMapped />
      <group scale={scale} />
    </mesh>
  )
}
