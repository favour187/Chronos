import { create } from 'zustand'
import { ERAS, type EraDef } from '../eras/data'

export type Phase =
  | 'boot'        // initial splash / preloader
  | 'menu'        // main menu
  | 'intro'       // cinematic opening (clock crack -> portal)
  | 'tunnel'      // time tunnel flythrough
  | 'era'         // exploring a world
  | 'finale'      // timeline collapse -> time core
  | 'credits'     // final cinematic ending

interface GameState {
  phase: Phase
  loadingProgress: number
  started: boolean
  muted: boolean
  quality: 'low' | 'med' | 'high'
  currentEraIndex: number
  collected: Set<string>
  artifactsSeen: Set<string>
  factOpen: string | null         // era.id when fact panel is open
  hoveredObject: string | null
  pointerLocked: boolean
  introStage: number              // 0..N for cinematic intro beats
  finaleProgress: number
  transitionAlpha: number         // 0..1 fades between scenes

  // actions
  setPhase: (p: Phase) => void
  setLoading: (n: number) => void
  startGame: () => void
  toggleMute: () => void
  setQuality: (q: 'low' | 'med' | 'high') => void
  goToEra: (i: number) => void
  nextEra: () => void
  collectArtifact: (eraId: string) => void
  openFact: (id: string | null) => void
  setHovered: (id: string | null) => void
  setPointerLocked: (b: boolean) => void
  setIntroStage: (n: number) => void
  setFinaleProgress: (n: number) => void
  setTransitionAlpha: (n: number) => void
  reset: () => void

  // derived
  currentEra: EraDef
  allArtifactsCollected: boolean
}

export const useGame = create<GameState>((set, get) => ({
  phase: 'boot',
  loadingProgress: 0,
  started: false,
  muted: false,
  quality: 'high',
  currentEraIndex: 0,
  collected: new Set<string>(),
  artifactsSeen: new Set<string>(),
  factOpen: null,
  hoveredObject: null,
  pointerLocked: false,
  introStage: 0,
  finaleProgress: 0,
  transitionAlpha: 1,

  setPhase: (p) => set({ phase: p }),
  setLoading: (n) => set({ loadingProgress: Math.max(0, Math.min(1, n)) }),
  startGame: () => set({ started: true, phase: 'intro', introStage: 0 }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setQuality: (q) => set({ quality: q }),
  goToEra: (i) => set({ currentEraIndex: Math.max(0, Math.min(ERAS.length - 1, i)), phase: 'era', factOpen: null }),
  nextEra: () => {
    const i = get().currentEraIndex
    if (i + 1 >= ERAS.length) {
      set({ phase: 'finale', finaleProgress: 0 })
    } else {
      set({ phase: 'tunnel', currentEraIndex: i + 1 })
    }
  },
  collectArtifact: (eraId) =>
    set((s) => {
      if (s.collected.has(eraId)) return {}
      const next = new Set(s.collected)
      next.add(eraId)
      return { collected: next }
    }),
  openFact: (id) => set({ factOpen: id }),
  setHovered: (id) => set({ hoveredObject: id }),
  setPointerLocked: (b) => set({ pointerLocked: b }),
  setIntroStage: (n) => set({ introStage: n }),
  setFinaleProgress: (n) => set({ finaleProgress: Math.max(0, Math.min(1, n)) }),
  setTransitionAlpha: (n) => set({ transitionAlpha: Math.max(0, Math.min(1, n)) }),
  reset: () =>
    set({
      phase: 'menu',
      currentEraIndex: 0,
      collected: new Set(),
      factOpen: null,
      introStage: 0,
      finaleProgress: 0,
    }),

  get currentEra() {
    return ERAS[get().currentEraIndex] ?? ERAS[0]
  },
  get allArtifactsCollected() {
    return get().collected.size >= ERAS.length
  },
}))
