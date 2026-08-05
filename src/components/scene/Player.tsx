// Smooth first-person style camera rig with keyboard + mouse-drag orbit.
// Keeps controls light (no heavy physics lib) and always works out of the box.
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface PlayerProps {
  initial?: [number, number, number]
  speed?: number
  bounds?: number
}

export function Player({ initial = [0, 2.5, 10], speed = 5.5, bounds = 45 }: PlayerProps) {
  const { camera, gl } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const yaw = useRef(Math.PI) // face -z
  const pitch = useRef(-0.05)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const velocity = useRef(new THREE.Vector3())
  const position = useRef(new THREE.Vector3(...initial))

  useEffect(() => {
    camera.position.copy(position.current)
    const onDown = (e: PointerEvent) => {
      // Only drag on canvas with primary button; ignore UI clicks
      if (e.target !== gl.domElement) return
      dragging.current = true
      last.current = { x: e.clientX, y: e.clientY }
      gl.domElement.setPointerCapture(e.pointerId)
    }
    const onUp = (e: PointerEvent) => {
      dragging.current = false
      try {
        gl.domElement.releasePointerCapture(e.pointerId)
      } catch {
        /* noop */
      }
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }
      yaw.current -= dx * 0.003
      pitch.current -= dy * 0.003
      pitch.current = Math.max(-1.2, Math.min(1.0, pitch.current))
    }
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      keys.current[e.code] = down
      if (down && e.code === 'Space') e.preventDefault()
    }
    const kd = onKey(true)
    const ku = onKey(false)
    const wheel = (e: WheelEvent) => {
      // Zoom = dolly forward/back
      const dir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
      position.current.addScaledVector(dir, -e.deltaY * 0.01)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    gl.domElement.addEventListener('wheel', wheel, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
      gl.domElement.removeEventListener('wheel', wheel)
    }
  }, [camera, gl])

  useFrame((_, dt) => {
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
    const move = new THREE.Vector3()
    const k = keys.current
    if (k['KeyW'] || k['ArrowUp']) move.add(forward)
    if (k['KeyS'] || k['ArrowDown']) move.sub(forward)
    if (k['KeyD'] || k['ArrowRight']) move.add(right)
    if (k['KeyA'] || k['ArrowLeft']) move.sub(right)
    if (move.lengthSq() > 0) move.normalize()
    const boost = k['ShiftLeft'] || k['ShiftRight'] ? 1.8 : 1
    velocity.current.lerp(move.multiplyScalar(speed * boost), 0.15)
    position.current.addScaledVector(velocity.current, dt)
    // Clamp to bounds & ground
    position.current.x = Math.max(-bounds, Math.min(bounds, position.current.x))
    position.current.z = Math.max(-bounds, Math.min(bounds, position.current.z))
    position.current.y = 2.2 + (k['Space'] ? 2 : 0)
    camera.position.lerp(position.current, 0.2)
    // Look
    const lookDir = new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch.current)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
    const target = position.current.clone().add(lookDir)
    camera.lookAt(target)
  })

  return null
}
