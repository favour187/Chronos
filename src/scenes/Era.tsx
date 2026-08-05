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
    if (isMobile) return 200
    if (quality === 'low') return 250
    if (quality === 'med') return 400
    return 600
  }, [quality])

  return (
    <div className="era-wrap" key={era.id}>
      {/* Mobile: CSS cover image (100% fill, no black edges, Ken Burns) */}
      {isMobile && (
        <div
          className="era-cinematic-bg"
          style={{
            backgroundImage: `url(${era.image})`,
          }}
        >
          <div className="era-bg-grade" style={{ background: `linear-gradient(180deg, ${era.sky}cc 0%, ${era.fog}55 50%, ${era.ground}ee 100%)` }} />
          <div className="era-bg-gold" style={{ background: `radial-gradient(ellipse at 50% 40%, ${era.accent}22 0%, transparent 60%)` }} />
        </div>
      )}

      <Canvas
        shadows={false}
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={{
          position: isMobile ? [0, 1.4, 7] : [0, 1.8, 9],
          fov: isMobile ? 55 : 60,
          near: 0.1,
          far: 1500,
        }}
        gl={{ alpha: isMobile }}
        style={{ position: 'absolute', inset: 0 }}
      >
        {!isMobile && <color attach="background" args={[era.sky]} />}
        {isMobile && <color attach="background" args={[0x000000]} />}
        {!isMobile && <fog attach="fog" args={[era.fog, 20, 90]} />}
        <ambientLight intensity={isMobile ? 0.3 : 0.7} color={'#ffffff'} />
        <directionalLight position={[0, 8, 4]} intensity={isMobile ? 0.3 : 0.8} color={'#ffffff'} />
        <pointLight position={[0, 2, -6]} intensity={2} color={era.accent} distance={30} />

        <Suspense fallback={null}>
          {!isMobile && <EraWorld eraId={era.id} accent={era.accent} />}
          {isMobile && (
            // Gold + accent stardust on top of the CSS image
            <>
              <Particles count={particleCount} color={era.accent} size={0.12} radius={10} shape="sphere" speed={0.15} />
              <Particles count={80} color="#ffd700" size={0.18} radius={8} shape="sphere" speed={0.08} />
              <Particles count={40} color="#ffffff" size={0.08} radius={12} shape="dust" speed={0.05} />
            </>
          )}
          {!isMobile && (
            <>
              <Particles count={particleCount} color={era.accent} size={0.08} radius={18} shape="dust" speed={0.12} />
              <Artifact era={era} position={[0, 1.6, -6]} />
              <Portal
                position={[0, 2.2, -12]}
                color={eraIndex < ERAS.length - 1 ? ERAS[eraIndex + 1].accent : '#c470ff'}
                label={eraIndex < ERAS.length - 1 ? `TRAVEL TO ${ERAS[eraIndex + 1].name.toUpperCase()}` : 'ENTER THE FINALE'}
                onEnter={nextEra}
                scale={1.1}
              />
            </>
          )}
          <Player />
        </Suspense>

        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={isMobile ? 0.8 : 1.0} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={isMobile ? 1.1 : 0.9} />
        </EffectComposer>
      </Canvas>

      {/* Cinematic letterbox bars for film feel */}
      <div className="letterbox-top" />
      <div className="letterbox-bottom" />
      <div className="film-grain" />

      <HUD />
      <FactPanel />
      <InteractionPrompt />
      <MobileControls />

      {/* Cinema-style era title card on mobile */}
      {isMobile && (
        <div className="era-title-card" key={era.id}>
          <div className="etc-line" style={{ background: era.accent }} />
          <div className="etc-year" style={{ color: era.accent }}>{era.year}</div>
          <h1 className="etc-name">{era.name}</h1>
          <div className="etc-sub">{era.subtitle}</div>
          <div className="etc-tagline">{era.tagline}</div>
        </div>
      )}
    </div>
  )
}
