// Locked camera — no movement, no auto-tour. Cinematic static composition,
// perfect for mobile standby/slideshow viewing.
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const isMobile =
  typeof window !== 'undefined' &&
  (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.matchMedia('(max-width: 900px)').matches)

export function Player() {
  const { camera } = useThree()
  useEffect(() => {
    // Static cinematic composition — eye level, slightly back.
    const target = isMobile
      ? new THREE.Vector3(0, 1.4, 7)       // closer on phone so image fills nicely
      : new THREE.Vector3(0, 1.8, 9)
    camera.position.copy(target)
    camera.lookAt(0, 1.6, -6)
  }, [camera])
  return null
}
