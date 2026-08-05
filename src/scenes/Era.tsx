import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useGame } from '../store/game'
import { ERAS } from '../eras/data'
import { Player } from '../components/scene/Player'
import { Particles } from '../components/scene/Particles'
import { Portal } from '../components/scene/Portal'
import { Artifact } from '../components/scene/Artifact'
import { EraWorld } from './EraWorld'
import { sfx } from '../audio/engine'
import { HUD } from '../components/ui/HUD'
import { FactPanel } from '../components/ui/FactPanel'
import { InteractionPrompt } from '../components/ui/InteractionPrompt'
import { MobileControls } from '../components/ui/MobileControls'

export function Era() {
  const eraIndex = useGame((s) => s.currentEraIndex)
  const era = ERAS[eraIndex]
  const nextEra = useGame((s) => s.nextEra)
  const quality = useGame((s) => s.quality)

  useEffect(() => {
    sfx.startAmbient(era.accent)
    sfx.chime()
    return () => sfx.stopAmbient()
  }, [era.id, era.accent])

  const particleCount = useMemo(() => {
    if (quality === 'low') return 250
    if (quality === 'med') return 500
    return 900
  }, [quality])

  return (
    <div className="era-wrap" key={era.id}>
      <Canvas
        shadows={false}
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={{ position: [0, isMobile ? 2.2 : 2.5, isMobile ? 9 : 10], fov: isMobile ? 62 : 65, near: 0.1, far: 2000 }}
      >
        <color attach="background" args={[era.sky]} />
        <fog attach="fog" args={[era.fog, 20, 90]} />
        <ambientLight intensity={0.55} color={era.secondary} />
        <directionalLight
          position={[10, 15, 8]}
          intensity={1.2}
          color="#ffffff"
          castShadow={quality !== 'low'}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-8, 6, -6]} intensity={2} color={era.accent} distance={40} />
        <pointLight position={[0, 4, -14]} intensity={2.5} color={era.accent} distance={30} />

        <Suspense fallback={null}>
          <EraWorld eraId={era.id} accent={era.accent} />
          <Particles
            count={particleCount}
            color={era.accent}
            size={0.07}
            radius={25}
            shape="dust"
            speed={0.15}
          />
          <Artifact era={era} position={[0, 1.6, -6]} />
          <Portal
            position={[0, 2.2, -14]}
            color={eraIndex < ERAS.length - 1 ? ERAS[eraIndex + 1].accent : '#c470ff'}
            label={eraIndex < ERAS.length - 1 ? `TRAVEL TO ${ERAS[eraIndex + 1].name.toUpperCase()}` : 'ENTER THE FINALE'}
            onEnter={nextEra}
            scale={1.2}
          />
          <Player />
        </Suspense>

        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={1.0} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.9} />
        </EffectComposer>
      </Canvas>
      <HUD />
      <FactPanel />
      <InteractionPrompt />
      <MobileControls />
    </div>
  )
}

const isMobile =
  typeof window !== 'undefined' &&
  (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.matchMedia('(max-width: 900px)').matches)
