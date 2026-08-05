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

const isMobile =
  typeof window !== 'undefined' &&
  (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.matchMedia('(max-width: 900px)').matches)

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
    if (isMobile) return 150
    if (quality === 'low') return 250
    if (quality === 'med') return 400
    return 600
  }, [quality])

  return (
    <div className="era-wrap" key={era.id}>
      <Canvas
        shadows={false}
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={{
          position: isMobile ? [0, 1.4, 7] : [0, 1.8, 9],
          fov: isMobile ? 55 : 60,
          near: 0.1,
          far: 1500,
        }}
      >
        <color attach="background" args={[era.sky]} />
        <fog attach="fog" args={[era.fog, 20, isMobile ? 70 : 90]} />
        <ambientLight intensity={0.7} color={'#ffffff'} />
        <directionalLight position={[0, 8, 4]} intensity={0.8} color={'#ffffff'} />
        <pointLight position={[0, 2, -6]} intensity={2} color={era.accent} distance={30} />

        <Suspense fallback={null}>
          <EraWorld eraId={era.id} accent={era.accent} />
          <Particles
            count={particleCount}
            color={era.accent}
            size={0.08}
            radius={18}
            shape="dust"
            speed={0.12}
          />
          {!isMobile && <Artifact era={era} position={[0, 1.6, -6]} />}
          {!isMobile && (
            <Portal
              position={[0, 2.2, -12]}
              color={eraIndex < ERAS.length - 1 ? ERAS[eraIndex + 1].accent : '#c470ff'}
              label={eraIndex < ERAS.length - 1 ? `TRAVEL TO ${ERAS[eraIndex + 1].name.toUpperCase()}` : 'ENTER THE FINALE'}
              onEnter={nextEra}
              scale={1.1}
            />
          )}
          <Player />
        </Suspense>

        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={isMobile ? 0.6 : 1.0} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={isMobile ? 1.0 : 0.9} />
        </EffectComposer>
      </Canvas>
      <HUD />
      <FactPanel />
      <InteractionPrompt />
      <MobileControls />
    </div>
  )
}
