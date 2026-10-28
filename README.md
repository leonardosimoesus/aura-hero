# AURA ONE — Hero prototype

Vite + React + TypeScript + Tailwind v4 + React Three Fiber + Drei.

    npm install
    npm run dev          # http://localhost:5173
    npm run build        # typecheck + production build (Vercel-ready: framework "Vite", output "dist")
    npm run build:single # one self-contained HTML file (quick previews)
    npm run render       # PNG renders of the 3 finishes → public/renders/ (first: npx playwright install chromium)

## Swap in a GLB
Name materials AURA_Shell / AURA_Trim / AURA_Pad in Blender, then:
`<AuraHero finish={f} Model={(p) => <GlbHeadphone url="/models/aura-one.glb" {...p} />} />`

## Structure
- `hero/AuraHero.tsx` reusable canvas + pointer listeners (cleaned on unmount, render paused offscreen)
- `hero/Rig.tsx` interaction only · `hero/Studio.tsx` camera + lights only
- `hero/ProceduralHeadphone.tsx` / `GlbHeadphone.tsx` interchangeable models (contract in `finishes.ts`)

## Known limits
Procedural model; PNG renders and visual/mobile/keyboard tests not yet run (no browser in the build sandbox).
