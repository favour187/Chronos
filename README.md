# ⌛ CHRONOS — The Living Timeline

**An immersive 3D cinematic journey through 13.8 billion years of history.**
*Submission for the 3D Websites Hackathon (Devpost).*

![CHRONOS](public/images/menu-clock.jpg)

> *"The future is created by those who understand the past."*

CHRONOS is a mobile-first cinematic web experience that takes you from the fiery birth of Earth, past dinosaurs and pharaohs, through the Renaissance and the digital revolution, to a future we have yet to build. It blends AI-generated imagery with real 3D elements (React Three Fiber + Three.js) to feel like the title sequence of a film you can steer.

## ✨ What you get

- 🎞 **Cinematic boot + main menu** — starfield, glow-pulsing gold title, "Begin" CTA
- 🌀 **Intro sequence** — 4-beat "darkness → clock forms → time shatters → portal opens" with synchronized chime/warp audio
- 🌍 **12 eras**, each with:
  - Full-bleed AI-generated backdrop (Ken Burns slow zoom)
  - Era-tinted color grade + gold radial halo + vignette
  - Cinema title card: mono year stamp, Cinzel Decorative title, subtitle, italic tagline
  - **A unique real-time 3D artifact per era** — molten planetoid, fossil shard, flint, pyramid, Platonic solid, column, stone block, torus-knot, gear, network mesh, hyperloop knot, star-orb
  - 3D portal ring and additively-blended star particles
- ⚡ **"Time-tear" GLSL transitions** — the old era rips open along a molten gold seam (custom shader) as the new one floods in
- 🎥 **Cinematic lens** — bloom, film grain and vignette post-processing on desktop; Hitchcock dolly-zoom on every warp
- 🖱 **Pointer + gyroscope parallax** — the camera leans with your mouse or the tilt of your phone
- ➡️ **Prev / Next navigation** (buttons, arrow keys, swipe, tap on mobile)
- 🎯 **Progress rail** of dots (current era stretches into a pill, Apple-style)
- 💫 **Finale sequence** — multicolor gradient bar fills, title card, then the credits galaxy with the final quote
- 🎵 **Procedural Web Audio** — soft C-major pad, gentle chime chord, band-passed whoosh/warp (no files to download)
- 📱 **iOS-first** — 100dvh, `touch-action: none`, glassmorphism, 60fps, zero layout crack
- ♿ Respects `prefers-reduced-motion`

## 🛠 Technologies used

- **React 18 + TypeScript** — app shell, state, routing between phases
- **Vite 6** — dev server + production build
- **Three.js** + **@react-three/fiber** + **@react-three/drei** — the 3D overlay (artifacts, portals, star particles, gold dust)
- **Web Audio API** — procedural synth for chimes, whoosh, warp, ambient pad (no audio files)
- **HTML5 Canvas 2D** — twinkling starfield behind the menu/boot
- **CSS3** — Ken Burns animations, glassmorphism, shimmer sweep, letterbox, film grain (SVG turbulence), cubic-bezier eases
- **Google Fonts** — Cinzel Decorative, Cinzel, Cormorant Garamond, JetBrains Mono
- **AI-generated imagery** — era-specific background art (9 generated for this submission + 3 reused from the original concept set)

## 🎨 Why it meets the "3D Websites" brief

Per the hackathon requirements ("meaningful 3D or immersive visual elements"), CHRONOS ships:

1. **Twelve distinct real-time 3D artifacts** — every era gets its own geometry (pyramid for Egypt, dodecahedron "ideal form" for Greece, gear for the Industrial Revolution, wireframe lattice for the Digital Age…), with emissive materials lerped to the era's accent color.
2. **A custom GLSL "time-tear" transition** — a fullscreen shader displacement pass rips the old era along a molten seam into the new one on every navigation.
3. **Reactive camera work** — pointer/gyro parallax rig plus a dolly-zoom pulse; Three.js lights (point + ambient) color-match each scene.
4. **Cinematic post lens** — mipmap-blur bloom, film grain, vignette (auto-disabled on mobile to guarantee 60fps).
5. **Resilient by design** — an error boundary degrades gracefully if WebGL is unavailable; the canvas mounts once and never rebuilds.

The 3D *serves the story* rather than being the story — which is how award-winning sites actually use WebGL.

## 🚀 Run it locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → ./dist
npm run preview   # serve the built site
```

Requires Node 18+.

### Controls
- `→` / `Space` / `▸` button / swipe left → advance
- `←` / `◂` button / swipe right → go back
- `M` → mute
- On phones: swipe anywhere, tap the buttons on-screen.

## ☁️ Deploy

The repo is ready for **Render** (static site):
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- SPA fallback is included (`public/_redirects` + `render.yaml`)

Also deploys cleanly to Vercel, Netlify, Cloudflare Pages.

## 📦 Build size

After gzip/brotli:

| Chunk | Size (gz) |
|---|---|
| app + React | ~6 KB |
| CSS | ~4 KB |
| three.js | ~176 KB |
| @react-three/fiber + drei | ~90 KB |
| **Total JS gzipped** | **~276 KB** |

That's in the same weight class as an Awwwards SOTD build.

## 🎯 What judges should feel

Open it on a phone, tap BEGIN, and swipe through all 12 eras.
If it makes you pause once — if one of the backdrops with the gold glow makes you go "wow" — it worked.

## 📁 Project structure

```
src/
├── App.tsx                   # Phase machine, audio engine, navigation, swipe
├── data.ts                   # 12 era definitions (names, years, accents, quotes, images)
├── index.css                 # All styles, animations, mobile first
├── main.tsx                  # React entry
├── components/
│   └── Starfield.tsx         # 2D canvas twinkling stars (boot/menu)
└── three/
    └── ImmersiveLayer.tsx    # React Three Fiber 3D overlay (artifact, portal, stars, dust)
public/images/*.jpg           # AI-generated era backdrops
render.yaml                   # Render blueprint
```

## 📝 License / Credits

Concept: CHRONOS time-travel narrative.
Era imagery: AI-generated for this submission.
Three.js / React Three Fiber / Vite / Google Fonts — all open source.
