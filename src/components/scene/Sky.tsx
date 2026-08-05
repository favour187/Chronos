import { useMemo } from 'react'
import * as THREE from 'three'

interface SkyProps {
  top: string
  bottom: string
}

export function Sky({ top, bottom }: SkyProps) {
  const mat = useMemo(() => {
    const vs = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPosition = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    const fs = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
        float t = max(pow(max(h, 0.0), exponent), 0.0);
        gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
      }
    `
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(top) },
        bottomColor: { value: new THREE.Color(bottom) },
        offset: { value: 10 },
        exponent: { value: 0.7 },
      },
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.BackSide,
      depthWrite: false,
    })
  }, [top, bottom])

  return (
    <mesh>
      <sphereGeometry args={[200, 32, 16]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}
