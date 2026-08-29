


import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { ERAS } from '../data'




const inputTarget = { x: 0, y: 0 }


const warpPulse = { v: 0 }


const CINE_LENS =
  typeof window !== 'undefined' &&
  window.matchMedia('(min-width: 900px) and (pointer: fine)').matches

interface Props {
  accent: string
  artifactEmoji: string
  eraIndex: number
}


function useAccentTarget(hex: string) {
  const target = useRef(new THREE.Color(hex))
  target.current.set(hex)
  return target
}

export function ImmersiveLayer({ accent, eraIndex }: Props) {
  const targetRef = useAccentTarget(accent)
  return (
    <div className="imm3d" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55, near: 0.1, far: 50 }}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.55} />
        <AccentLights targetRef={targetRef} />
        <pointLight position={[-3, -1, 3]} intensity={0.9} color="#ffd700" distance={10} />
        <InputListener />
        <CameraRig eraIndex={eraIndex} />
        <TimeTear eraIndex={eraIndex} />
        <Stars targetRef={targetRef} />
        <EraArtifact key={eraIndex} eraIndex={eraIndex} targetRef={targetRef} />
        <PortalRing targetRef={targetRef} />
        <GoldDust />
        <AccentSync hex={accent} targetRef={targetRef} />
        {CINE_LENS && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.5} luminanceSmoothing={0.25} radius={0.72} />
            <Noise opacity={0.05} />
            <Vignette offset={0.22} darkness={0.5} eskil={false} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}



function InputListener() {
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      inputTarget.x = (e.clientX / window.innerWidth) * 2 - 1
      inputTarget.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      inputTarget.x = THREE.MathUtils.clamp(e.gamma / 28, -1, 1)
      inputTarget.y = THREE.MathUtils.clamp(-(e.beta - 45) / 28, -1, 1)
    }
    window.addEventListener('pointermove', onPointer)
    window.addEventListener('deviceorientation', onOrient)
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])
  return null
}



function CameraRig({ eraIndex }: { eraIndex: number }) {
  const { camera } = useThree()
  const last = useRef(eraIndex)
  useFrame((_, dt) => {
    if (last.current !== eraIndex) {
      last.current = eraIndex
      warpPulse.v = 1
    }
    warpPulse.v *= Math.exp(-dt * 3.2)
    if (warpPulse.v < 0.001) warpPulse.v = 0

    const k = 1 - Math.pow(0.002, dt)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, inputTarget.x * 0.85, k)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, inputTarget.y * 0.5, k)
    camera.position.z = 7 + warpPulse.v * 2.4

    const pc = camera as THREE.PerspectiveCamera
    pc.fov = 55 - warpPulse.v * 9
    pc.updateProjectionMatrix()
    camera.lookAt(0, 0, -2)
  })
  return null
}



function AccentSync({ hex, targetRef }: { hex: string; targetRef: MutableRefObject<THREE.Color> }) {
  useFrame(() => { targetRef.current.set(hex) })
  return null
}

function AccentLights({ targetRef }: { targetRef: MutableRefObject<THREE.Color> }) {
  const light1 = useRef<THREE.PointLight>(null)
  const cur = useMemo(() => new THREE.Color('#ffffff'), [])
  useFrame((_, dt) => {
    if (!light1.current) return
    cur.lerp(targetRef.current, Math.min(1, dt * 4))
    light1.current.color.copy(cur)
  })
  return <pointLight ref={light1} position={[0, 2, 5]} intensity={2.4} distance={12} />
}






const TEAR_VERT =  `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const TEAR_FRAG =  `
precision highp float;
varying vec2 vUv;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float progress;   // 0 = old era, 1 = new era
uniform float time;
uniform float aspect1;
uniform float aspect2;
uniform float screenAspect;

// simplex noise (Ashima, 2D)
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// CSS "cover" fit for arbitrary image/screen aspect
vec2 cover(vec2 uv, float imgAspect, float scrAspect) {
  vec2 st = uv - 0.5;
  float r = scrAspect / imgAspect;
  if (r < 1.0) st.x *= r; else st.y /= r;
  return st + 0.5;
}

void main() {
  float p = smoothstep(0.0, 1.0, progress);
  float n = snoise(vUv * vec2(3.0, 5.0) + time * 0.25);
  // tear front sweeps diagonally with a noisy, electric edge
  float front = vUv.x * 0.85 + (1.0 - vUv.y) * 0.15;
  float field = front + n * 0.18;
  float width = mix(0.02, 0.35, sin(p * 3.14159)); // seam opens then seals
  float mask = smoothstep(p * 1.3 - width, p * 1.3, field);

  // the wound displaces both worlds around the seam
  float wound = 1.0 - smoothstep(0.0, width * 1.6, abs(field - p * 1.3));
  vec2 pull = vec2(0.0, wound * 0.12 * sin(p * 3.14159));

  vec2 uv1 = cover(vUv, aspect1, screenAspect);
  vec2 uv2 = cover(vUv, aspect2, screenAspect);
  vec3 c1 = texture2D(tex1, uv1 + pull).rgb;
  vec3 c2 = texture2D(tex2, uv2 - pull).rgb;
  vec3 col = mix(c2, c1, mask);

  // molten gold light inside the tear
  vec3 gold = vec3(1.0, 0.78, 0.32);
  col += gold * wound * 1.6 * sin(p * 3.14159);
  col += gold * n * wound * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
`

function TimeTear({ eraIndex }: { eraIndex: number }) {
  const { size } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const texRef = useRef<(THREE.Texture | null)[]>([])
  const tr = useRef<{ from: number; to: number } | null>(null)
  const last = useRef(eraIndex)

  const uniforms = useMemo(
    () => ({
      tex1: { value: null as THREE.Texture | null },
      tex2: { value: null as THREE.Texture | null },
      progress: { value: 1 },
      time: { value: 0 },
      aspect1: { value: 1 },
      aspect2: { value: 1 },
      screenAspect: { value: 1 },
    }),
    [],
  )



  useEffect(() => {
    let alive = true
    const loader = new THREE.TextureLoader()
    ERAS.forEach((e, i) => {
      loader.load(e.image, (t) => {
        if (!alive) { t.dispose(); return }
        t.colorSpace = THREE.SRGBColorSpace
        texRef.current[i] = t
      })
    })
    return () => { alive = false }
  }, [])

  useFrame(({ clock }) => {
    if (last.current !== eraIndex) {
      tr.current = { from: last.current, to: eraIndex }
      last.current = eraIndex
    }
    const t = tr.current
    const mesh = meshRef.current
    const mat = matRef.current
    if (!mesh || !mat || !t) return
    const texA = texRef.current[t.from]
    const texB = texRef.current[t.to]
    const active = warpPulse.v > 0.02 && !!texA && !!texB
    mesh.visible = active
    if (!active) return
    mat.uniforms.tex1.value = texA
    mat.uniforms.tex2.value = texB
    mat.uniforms.aspect1.value = (texA!.image.width as number) / (texA!.image.height as number)
    mat.uniforms.aspect2.value = (texB!.image.width as number) / (texB!.image.height as number)
    mat.uniforms.screenAspect.value = size.width / size.height
    mat.uniforms.progress.value = 1 - warpPulse.v
    mat.uniforms.time.value = clock.getElapsedTime()
  })

  return (
    <ScreenQuad ref={meshRef} visible={false} renderOrder={999} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        args={[{
          uniforms,
          vertexShader: TEAR_VERT,
          fragmentShader: TEAR_FRAG,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        }]}
      />
    </ScreenQuad>
  )
}





type ArtifactKind =
  | 'planetoid' | 'shard' | 'flint' | 'pyramid' | 'platonic' | 'column'
  | 'block' | 'flow' | 'gear' | 'mesh' | 'hyperloop' | 'starorb'

const ERA_ARTIFACTS: { kind: ArtifactKind; spin: number; scale: number }[] = [
  { kind: 'planetoid', spin: 0.5, scale: 1.0 },
  { kind: 'shard', spin: 0.65, scale: 1.05 },
  { kind: 'flint', spin: 0.7, scale: 0.9 },
  { kind: 'pyramid', spin: 0.4, scale: 1.1 },
  { kind: 'platonic', spin: 0.5, scale: 0.95 },
  { kind: 'column', spin: 0.44, scale: 1.0 },
  { kind: 'block', spin: 0.5, scale: 0.95 },
  { kind: 'flow', spin: 0.6, scale: 0.9 },
  { kind: 'gear', spin: 1.1, scale: 1.0 },
  { kind: 'mesh', spin: 0.6, scale: 1.0 },
  { kind: 'hyperloop', spin: 0.75, scale: 0.95 },
  { kind: 'starorb', spin: 0.3, scale: 1.0 },
]

function artifactGeometry(kind: ArtifactKind) {
  switch (kind) {
    case 'planetoid': return <icosahedronGeometry args={[0.55, 0]} />
    case 'shard': return <tetrahedronGeometry args={[0.62, 0]} />
    case 'flint': return <octahedronGeometry args={[0.5, 0]} />
    case 'pyramid': return <coneGeometry args={[0.52, 0.72, 4]} />
    case 'platonic': return <dodecahedronGeometry args={[0.5, 0]} />
    case 'column': return <cylinderGeometry args={[0.3, 0.38, 0.85, 10]} />
    case 'block': return <boxGeometry args={[0.68, 0.68, 0.68]} />
    case 'flow': return <torusKnotGeometry args={[0.38, 0.13, 96, 12]} />
    case 'gear': return <torusGeometry args={[0.48, 0.17, 14, 36]} />
    case 'mesh': return <icosahedronGeometry args={[0.56, 1]} />
    case 'hyperloop': return <torusKnotGeometry args={[0.4, 0.12, 128, 16, 2, 5]} />
    case 'starorb': return <sphereGeometry args={[0.5, 24, 24]} />
  }
}

function EraArtifact({ eraIndex, targetRef }: { eraIndex: number; targetRef: MutableRefObject<THREE.Color> }) {
  const g = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const shell = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const cur = useMemo(() => new THREE.Color(targetRef.current), [])
  const cfg = ERA_ARTIFACTS[eraIndex % ERA_ARTIFACTS.length]
  const isWire = cfg.kind === 'mesh'

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    if (g.current) {
      g.current.rotation.y = t * cfg.spin
      g.current.rotation.x = Math.sin(t * 0.4) * 0.12
      g.current.position.y = -1.1 + Math.sin(t * 1.1) * 0.14

      const s = cfg.scale * (1 + warpPulse.v * 0.6)
      g.current.scale.setScalar(0.55 * s)
    }
    cur.lerp(targetRef.current, Math.min(1, dt * 3))
    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial
      if (!isWire) {
        m.color.copy(cur)
        m.emissive.copy(cur)
        m.emissiveIntensity = (2 + Math.sin(t * 2.2) * 0.6) * (1 + warpPulse.v * 2.5)
      } else {
        m.color.copy(cur)
        m.emissive.copy(cur)
        m.emissiveIntensity = 1.4 * (1 + warpPulse.v * 2)
      }
    }
    if (shell.current) {
      const m = shell.current.material as THREE.MeshBasicMaterial
      m.color.copy(cur)
      m.opacity = 0.22 + Math.sin(t * 1.4) * 0.08
    }
    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial
      m.color.copy(cur)
      m.opacity = 0.55 + Math.sin(t * 1.6) * 0.1
    }
  })

  return (
    <group ref={g} position={[-2.4, -1.1, -3]}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.025, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <mesh ref={core} rotation={[0.5, 0.6, 0]}>
        {artifactGeometry(cfg.kind)}
        {isWire ? (
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" wireframe />
        ) : (
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
            metalness={0.8}
            roughness={0.18}
            flatShading={cfg.kind === 'planetoid' || cfg.kind === 'shard' || cfg.kind === 'pyramid' || cfg.kind === 'platonic'}
          />
        )}
      </mesh>
      {}
      {cfg.kind === 'starorb' && (
        <mesh ref={shell}>
          <icosahedronGeometry args={[0.85, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.25} />
        </mesh>
      )}
      {}
      {cfg.kind === 'gear' && (
        <mesh ref={shell} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.72, 0.05, 8, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  )
}



function Stars({ targetRef }: { targetRef: MutableRefObject<THREE.Color> }) {
  const ref = useRef<THREE.Points>(null)
  const cur = useMemo(() => new THREE.Color(targetRef.current), [])
  const positions = useMemo(() => {
    const n = 220
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18
      arr[i * 3 + 2] = -10 - Math.random() * 12
    }
    return arr
  }, [])
  useFrame((_, dt) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.PointsMaterial
    cur.lerp(targetRef.current, Math.min(1, dt * 3))
    mat.color.copy(cur)
    const p = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const a = p.array as Float32Array

    const speed = 0.25 + warpPulse.v * 14
    for (let i = 0; i < a.length; i += 3) {
      a[i] -= speed * dt
      if (a[i] < -15) a[i] = 15
    }
    p.needsUpdate = true
    ref.current.rotation.z += dt * 0.015
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function PortalRing({ targetRef }: { targetRef: MutableRefObject<THREE.Color> }) {
  const ref = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const cur = useMemo(() => new THREE.Color(targetRef.current), [])
  useFrame(({ clock }, dt) => {
    if (!ref.current || !inner.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.z = t * 0.35
    inner.current.rotation.z = -t * 0.5
    const s = 1 + Math.sin(t * 1.6) * 0.05 + warpPulse.v * 0.5
    ref.current.scale.setScalar(s)
    inner.current.scale.setScalar(1 + Math.sin(t * 2.1) * 0.04 + warpPulse.v * 0.8)
    cur.lerp(targetRef.current, Math.min(1, dt * 3))
    const m = ref.current.material as THREE.MeshBasicMaterial
    const mi = inner.current.material as THREE.MeshBasicMaterial
    m.color.copy(cur)
    mi.color.copy(cur)
    m.opacity = 0.45 + Math.sin(t * 2.2) * 0.15 + warpPulse.v * 0.3
    mi.opacity = 0.25 + Math.sin(t * 2.8 + 1) * 0.1 + warpPulse.v * 0.4
  })
  return (
    <group position={[3.0, -0.3, -4]}>
      <mesh ref={ref}>
        <torusGeometry args={[1.3, 0.035, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[0.95, 0.018, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function GoldDust() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const n = 110
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = -3 - Math.random() * 6
    }
    return arr
  }, [])
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * (0.04 + warpPulse.v * 0.6)
    ref.current.rotation.x += dt * 0.02
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#ffd700"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
