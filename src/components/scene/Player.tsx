// Mobile-first camera rig with auto-tour (slow cinematic dolly),
// keyboard/mouse on desktop, swipe/tap on touch, and a window event
// for the virtual joystick fired by MobileControls.
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const isMobile =
  typeof window !== 'undefined' &&
  (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.matchMedia('(max-width: 900px)').matches)

export function Player() {
  const { camera, gl } = useThree()
  const pos = useRef(new THREE.Vector3(0, isMobile ? 2.2 : 2.0, isMobile ? 9 : 10))
  const yaw = useRef(Math.PI)
  const pitch = useRef(isMobile ? -0.1 : -0.05)
  const keys = useRef<Record<string, boolean>>({})
  const joy = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const auto = useRef(true)
  const orbitA = useRef(0)
  const phase = useRef<'approach' | 'orbit'>('approach')

  useEffect(() => {
    // Reset on mount
    pos.current.set(0, isMobile ? 2.2 : 2.0, isMobile ? 9 : 10)
    yaw.current = Math.PI
    pitch.current = isMobile ? -0.1 : -0.05
    orbitA.current = 0
    phase.current = 'approach'
    auto.current = true
  }, [])

  useEffect(() => {
    const kd = (e: KeyboardEvent) => { keys.current[e.code] = true; auto.current = true }
    const ku = (e: KeyboardEvent) => { keys.current[e.code] = false }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)

    const onDown = (e: PointerEvent) => {
      if (e.target !== gl.domElement) return
      dragging.current = true
      last.current = { x: e.clientX, y: e.clientY }
      auto.current = true
      gl.domElement.setPointerCapture(e.pointerId)
    }
    const onUp = (e: PointerEvent) => {
      dragging.current = false
      try { gl.domElement.releasePointerCapture(e.pointerId) } catch { /* noop */ }
      if (isMobile) window.setTimeout(() => { auto.current = false }, 3000)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }
      yaw.current -= dx * 0.003
      pitch.current -= dy * 0.003
      pitch.current = Math.max(-0.8, Math.min(0.6, pitch.current))
    }
    const onWheel = (e: WheelEvent) => {
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
      pos.current.addScaledVector(forward, -e.deltaY * 0.01)
      auto.current = true
      if (isMobile) window.setTimeout(() => { auto.current = false }, 3000)
    }
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragging.current = true
        last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current || e.touches.length !== 1) return
      const dx = e.touches[0].clientX - last.current.x
      const dy = e.touches[0].clientY - last.current.y
      last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      yaw.current -= dx * 0.005
      pitch.current -= dy * 0.005
      pitch.current = Math.max(-0.8, Math.min(0.6, pitch.current))
      auto.current = true
    }
    const onTouchEnd = () => {
      dragging.current = false
      window.setTimeout(() => { auto.current = false }, 4000)
    }
    const onJoy = (e: Event) => {
      const ev = e as CustomEvent<{ x: number; y: number }>
      joy.current = ev.detail
      auto.current = true
    }
    window.addEventListener('chronos-joy', onJoy as EventListener)

    gl.domElement.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointermove', onMove)
    gl.domElement.addEventListener('wheel', onWheel, { passive: true })
    gl.domElement.addEventListener('touchstart', onTouchStart, { passive: true })
    gl.domElement.addEventListener('touchmove', onTouchMove, { passive: true })
    gl.domElement.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
      gl.domElement.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointermove', onMove)
      gl.domElement.removeEventListener('wheel', onWheel)
      gl.domElement.removeEventListener('touchstart', onTouchStart)
      gl.domElement.removeEventListener('touchmove', onTouchMove)
      gl.domElement.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('chronos-joy', onJoy as EventListener)
    }
  }, [gl])

  useFrame((_, dt) => {
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
    const speed = isMobile ? 3.0 : 5.5
    const move = new THREE.Vector3()
    const k = keys.current
    if (k['KeyW'] || k['ArrowUp']) move.add(forward)
    if (k['KeyS'] || k['ArrowDown']) move.sub(forward)
    if (k['KeyD'] || k['ArrowRight']) move.add(right)
    if (k['KeyA'] || k['ArrowLeft']) move.sub(right)
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed)
    if (Math.abs(joy.current.x) > 0.05 || Math.abs(joy.current.y) > 0.05) {
      move.addScaledVector(right, joy.current.x * 3)
      move.addScaledVector(forward, -joy.current.y * 3)
    }
    pos.current.addScaledVector(move, dt)

    // Auto-tour: slow dolly forward, then slow orbit around the center
    if (auto.current && move.lengthSq() < 0.01 && !dragging.current) {
      if (phase.current === 'approach') {
        pos.current.addScaledVector(forward, dt * (isMobile ? 1.2 : 0.8))
        if (pos.current.z < (isMobile ? 3 : 2)) phase.current = 'orbit'
      } else {
        orbitA.current += dt * (isMobile ? 0.12 : 0.06)
        const r = isMobile ? 9 : 10
        pos.current.x = Math.sin(orbitA.current) * r * 0.6
        pos.current.z = Math.cos(orbitA.current) * r * 0.4 - 1
        yaw.current = -orbitA.current + Math.PI / 2
      }
    }

    const lim = isMobile ? 10 : 22
    pos.current.x = Math.max(-lim, Math.min(lim, pos.current.x))
    pos.current.z = Math.max(-16, Math.min(14, pos.current.z))
    pos.current.y = isMobile ? 2.2 : 2.0
    camera.position.lerp(pos.current, isMobile ? 0.18 : 0.25)

    const lookDir = new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch.current)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
    camera.lookAt(pos.current.clone().add(lookDir.multiplyScalar(10)))
  })

  return null
}
