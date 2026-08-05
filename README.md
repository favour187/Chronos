# ⌛ CHRONOS — The Living Timeline

**An award-grade 3D interactive web experience** · React · Three.js · Vite · TypeScript

> *"The future is created by those who understand the past."*

CHRONOS is a cinematic, game-like journey through 13.8 billion years of history. Visitors step into a time machine, fly through a wormhole of light, and explore twelve fully-3D worlds — from the fires of Earth's birth, past dinosaurs, pharaohs and aqueducts, into the digital age and beyond to the edge of the cosmos itself. Along the way they collect glowing artifacts from each era, which finally repair the collapsing timeline.

Built for the **3D Websites Hackathon**. No external 3D model or audio assets are required — every world is generated procedurally at runtime, and every sound is synthesized with the Web Audio API.

---

## 🎬 Experience Flow

```
Boot Loader  →  Main Menu  →  Cinematic Intro
       (heartbeat · clock · crack · portal · warp)
                              ↓
                        Time Tunnel
                              ↓
  Birth of Earth ←→ Dinosaurs ←→ Early Humans ←→ Egypt ←→ Greece ←→ Rome
       ←→ Medieval ←→ Renaissance ←→ Industrial ←→ Digital ←→ Future ←→ Cosmos
                              ↓
       Artifact Collection (12 total, one per era)
                              ↓
               Timeline Collapse Finale (Time Core)
                              ↓
             Credits Cinematic (Earth → Solar → Galaxy)
```

## ✨ Feature Highlights

- 🎞 **Cinematic intro** — particles forming a clock, thunder-crack, frozen shards, portal warp
- 🌀 **Time tunnel** — rings of colored light + star streaks for era transitions
- 🌋 **12 procedural worlds** — each era has unique geometry, lighting, palette, fog
  - Volcanoes/lava/asteroids · jungles/dinosaurs · caves/fires · pyramids/sphinx
  - Parthenon & columns · Colosseum & aqueducts · castles & a circling dragon
  - Duomo & flying machines · smokestacks & steam trains
  - Server towers & binary rain · floating cities & a space elevator · black hole & nebula
- 🎯 **Artifacts** — spinning octahedral crystals per era; click to collect, HUD tracks progress
- 🎛 **First-person explorer controls** — WASD/arrows to move, mouse-drag to look, scroll to zoom, Shift to sprint
- 📜 **Learning system** — "Era Briefing" prompt opens a hologram-style facts panel for each world
- 🌸 **Post-processing** — bloom, vignette, scanlines, fog, additively-blended particles
- 🎵 **Procedural audio** — heartbeat, chimes, thunder, warp whooshes, era-dependent ambient pads (Web Audio, no files to load)
- 🖥 **Futuristic glass-HUD** — compass, timeline rail, artifact counter, audio/quality/fullscreen controls
- 📱 **Responsive** — scales to mobile with touch-friendly controls; LOW/MED/HIGH quality toggle
- ♿ **Accessibility** — `prefers-reduced-motion` respected; `M` to mute, `Esc` for menu

## 🧰 Tech Stack

| Layer | Library |
|-------|---------|
| UI framework | React 18 + TypeScript |
| Build | Vite 6 |
| 3D renderer | **three.js** |
| React renderer | **@react-three/fiber** |
| Helpers (Text, Html, Stars) | **@react-three/drei** |
| Post-fx (Bloom, Vignette) | **@react-three/postprocessing** |
| State | **zustand** |
| Audio | **Web Audio API** (procedural synthesis, no assets) |
| Fonts | Google Fonts: Cinzel Decorative, Cinzel, Cormorant Garamond, JetBrains Mono |

## 🚀 Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build  →  ./dist
npm run preview    # serve the built site
npm run typecheck  # tsc --noEmit (strict mode)
```

Requires **Node 18+**.

> First click on the page will "unmute" the audio (browsers require a user gesture before audio can play). Click the *"🔊 Enable audio"* button on the loader or *Begin Journey* to kick things off.

### Controls

| Input | Action |
|-------|--------|
| `W A S D` / Arrow keys | Move |
| `Shift` | Sprint |
| `Space` | Look up / rise |
| Click & drag | Look around |
| Scroll wheel | Zoom / dolly |
| Click glowing **Artifact** | Collect it |
| Click blue **Portal** at the end of each era | Warp to next era |
| Click **Era Briefing** (right side) | Open facts panel |
| Click timeline nodes at bottom | Jump to already-visited eras |
| `M` | Mute / unmute |
| `Esc` | Return to menu |

## ☁️ Deploy to Render

Repo ships ready for Render:

- **`render.yaml`** (Blueprint) creates a **Static Site**:
  - **Build Command:** `npm install && npm run build`
  - **Publish Directory:** `dist`
  - SPA rewrite `/* → /index.html` (both via `render.yaml` routes and `public/_redirects`)
  - Long-cache headers for `/assets/*`
- Or configure a manual static site with the same values.
- After pushing, go to **dashboard.render.com → New → Blueprint** and connect the repo.

## 📁 Project Structure

```
.
├── index.html
├── render.yaml                # Render Blueprint
├── public/
│   ├── _redirects             # SPA fallback
│   ├── favicon.svg · icons.svg
│   └── images/                # (legacy hero/era images, optional)
└── src/
    ├── main.tsx               # React entry
    ├── App.tsx                # Phase router
    ├── index.css              # All global styles (glass HUD, animations)
    ├── audio/engine.ts        # Procedural Web Audio engine
    ├── eras/data.ts           # All 12 eras: names, years, colors, facts, artifacts
    ├── store/game.ts          # Zustand global game state (phase, era, collected, etc.)
    ├── scenes/
    │   ├── Boot.tsx           # Preloader
    │   ├── Menu.tsx           # Main menu (spinning clock, title, buttons)
    │   ├── Intro.tsx          # Cinematic: heartbeat → clock → crack → portal
    │   ├── Tunnel.tsx         # Time-warp tunnel between eras
    │   ├── Era.tsx            # Generic era scene wrapper (lighting, fx, portal, artifact)
    │   ├── EraWorld.tsx       # All 12 procedural worlds
    │   ├── Finale.tsx         # Timeline collapse → Time Core
    │   └── Credits.tsx        # Final Earth→solar→galaxy cinematic
    ├── components/
    │   ├── scene/             # Reusable 3D primitives (Particles, Portal, Artifact, Ground, Sky, Player)
    │   └── ui/                # HUD, FactPanel, InteractionPrompt
    └── hooks, utils
```

## ✅ Verified Build

```
> chronos-timeline@1.0.0 build
> tsc -b && vite build

vite v6.4.3 building for production...
transforming...
✓ 702 modules transformed.
dist/index.html                 1.13 kB │ gzip:  0.57 kB
dist/assets/index-*.css        16.18 kB │ gzip:  3.76 kB
dist/assets/motion-*.js         0.03 kB │ gzip:  0.05 kB
dist/assets/index-*.js         65.29 kB │ gzip: 19.08 kB
dist/assets/r3f-*.js          478.26 kB │ gzip:154.40 kB
dist/assets/three-*.js        683.54 kB │ gzip:176.15 kB
✓ built in ~9s
```

`npm run typecheck` passes cleanly with strict TS (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`).

## 🎨 Design Notes

- **Color language** follows the SPEC: cosmic void `#0a0a12`, gold `#ffd700`, cyan `#00d4ff`, magenta `#ff006e`, purple `#c470ff`, with each era contributing its own accent.
- **Typography** pairs Cinzel Decorative (display), Cinzel (headings/UI), Cormorant Garamond (body/narration) and JetBrains Mono (technical readouts) for the premium-documentary feel.
- **Geometry is intentionally stylized** — pyramids, columns, castles, dragons and black holes read instantly at low poly cost, keeping frame rates high.
- **No external asset downloads** means the site boots cold on Render's CDN without waiting for 3D model files.

## 🏆 Hackathon Notes

What makes this feel like *"a movie + a game + a museum + a futuristic website"*:

1. You **start inside a cutscene**, not on a landing page.
2. You **move freely** in 3D with first-person controls instead of scrolling.
3. Every era is a **visually distinct world** you arrive at through a **warp sequence**.
4. **Procedural audio** sells the immersion with zero asset weight.
5. **Collecting artifacts** drives progression and unlocks the finale.
6. The **finale smashes all eras together** in a collapsing-timeline set-piece.
7. The **closing cinematic** pulls the camera out of Earth, out of the solar system, to the cosmos.

Enjoy the journey. ⏳
