import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useGame } from '../store/game'
import { ERAS } from '../eras/data'
import { Player } from '../components/scene/Player'
import { Particles } from '../components/scene/Particles'
import { Portal } from '../components/scene/Portal'
import { Artifact } from '../components/scene/Artifact'
import { Sky } from '../components/scene/Sky'
import { Ground } from '../components/scene/Ground'
import { EraWorld } from './EraWorld'
import { sfx } from '../audio/engine'
import { HUD } from '../components/ui/HUD'
import { FactPanel } from '../components/ui/FactPanel'
import { InteractionPrompt } from '../components/ui/InteractionPrompt'

export function Era() {
  const eraIndex = useGame((s) => s.currentEraIndex)
  const era = ERAS[eraIndex]
  const nextEra = useGame((s) => s.nextEra)
  const quality = useGame((s) => s.quality)

  useEffect(() => {
    sfx.startAmbient(era.accent)
    // Voice-style narration (procedural chime + subtitle timing handled in HUD)
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
        shadows={quality !== 'low'}
        dpr={quality === 'low' ? [1, 1.25] : [1, 2]}
        camera={{ position: [0, 2.5, 10], fov: 65, near: 0.1, far: 500 }}
      >
        <color attach="background" args={[era.sky]} />
        <fog attach="fog" args={[era.fog, 15, 60]} />
        <ambientLight intensity={0.35} color={era.secondary} />
        <directionalLight
          position={[10, 15, 8]}
          intensity={1.5}
          color="#ffffff"
          castShadow={quality !== 'low'}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-8, 6, -6]} intensity={1.5} color={era.accent} distance={30} />

        <Suspense fallback={null}>
          <Sky top={era.sky} bottom={era.fog} />
          <Ground color={era.ground} accent={era.accent} />
          <EraWorld eraId={era.id} accent={era.accent} />
          <Particles
            count={particleCount}
            color={era.accent}
            size={0.06}
            radius={20}
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
          <Bloom intensity={0.9} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
        </EffectComposer>
      </Canvas>
      <HUD />
      <FactPanel />
      <InteractionPrompt />
    </div>
  )
}
