import { lazy, Suspense, useState } from 'react'
import { FINISHES, type FinishId } from './hero/finishes'
import { Poster } from './hero/Poster'

const AuraHero = lazy(() => import('./hero/AuraHero')) // three.js lives in its own chunk

const links = [['Product', '#product'], ['Experience', '#experience'], ['Specifications', '#specifications']]

export default function App() {
  const [finishId, setFinishId] = useState<FinishId>('midnight')
  const [resetKey, setResetKey] = useState(0)
  const finish = FINISHES[finishId]

  // Render mode used by scripts/render.mjs to export consistent PNGs of each finish.
  const renderId = new URLSearchParams(location.search).get('render') as FinishId | null
  if (renderId && FINISHES[renderId]) {
    return <div id="stage" className="fixed inset-0 bg-ink"><Suspense fallback={null}><AuraHero finish={FINISHES[renderId]} still /></Suspense></div>
  }

  return (
    <div className="bg-ink text-bone">
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 md:px-12">
        <a href="#top" className="font-display text-lg font-semibold tracking-[0.34em]">AURA</a>
        <nav aria-label="Primary" className="hidden gap-10 text-sm text-titanium md:flex">
          {links.map(([t, h]) => <a key={h} href={h} className="transition-colors hover:text-bone">{t}</a>)}
        </nav>
        <div className="flex items-center gap-5">
          <details className="relative md:hidden">
            <summary className="cursor-pointer text-sm text-titanium">Menu</summary>
            <nav aria-label="Mobile" className="absolute right-0 top-8 flex w-44 flex-col gap-4 rounded-lg bg-graphite p-5 text-sm">
              {links.map(([t, h]) => <a key={h} href={h}>{t}</a>)}
            </nav>
          </details>
          <button disabled title="The cart arrives in the next phase" aria-label="Shopping bag (available in the next phase)" className="text-titanium opacity-70">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
          </button>
        </div>
      </header>

      <main id="top">
        <section aria-labelledby="hero-title" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[radial-gradient(55%_45%_at_50%_52%,#171A1F_0%,#08090B_72%)]">
          <h1 id="hero-title" className="hero-title font-display absolute inset-x-0 top-[17%] select-none text-center text-[clamp(3.1rem,13.2vw,12.5rem)] font-extrabold leading-[.84] tracking-[-0.035em] md:top-[15%]">
            FEEL EVERY<br />FREQUENCY.
          </h1>

          <Suspense fallback={<Poster />}><AuraHero finish={finish} resetKey={resetKey} /></Suspense>
          <div aria-hidden className="pointer-events-none absolute bottom-[19%] left-1/2 h-6 w-[38%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl md:bottom-[17%]" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 grid items-end gap-6 px-6 pb-8 md:grid-cols-[1fr_auto_1fr] md:px-12 md:pb-10">
            <div className="pointer-events-auto flex flex-col gap-5">
              <p className="max-w-xs text-base text-titanium md:text-lg">Immersive sound. Effortless design.</p>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
                <a href="#experience" className="rounded-full bg-bone px-7 py-3.5 text-sm font-medium text-ink transition duration-200 hover:bg-white active:scale-[.97]">Explore the Experience</a>
                <a href="#product" className="text-sm text-bone underline decoration-titanium/50 underline-offset-8 transition-colors hover:decoration-ice">Discover AURA ONE</a>
              </div>
            </div>
            <a href="#product" aria-label="Scroll to next section" className="pointer-events-auto hidden flex-col items-center gap-2 text-xs text-titanium md:flex">Scroll<span className="cue h-10 w-px bg-titanium/60" /></a>
            <div className="pointer-events-auto flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-self-end"><div role="radiogroup" aria-label="Finish" className="flex items-center gap-3">
              {Object.values(FINISHES).map((f) => (
                <button key={f.id} role="radio" aria-checked={f.id === finishId} aria-label={f.label} onClick={() => setFinishId(f.id)}
                  className={`grid h-8 w-8 place-items-center rounded-full border transition ${f.id === finishId ? 'border-ice' : 'border-white/15 hover:border-titanium'}`}>
                  <span className="h-5 w-5 rounded-full" style={{ background: f.shell }} />
                </button>
              ))}
              <span aria-live="polite" className="w-28 text-sm text-titanium">{finish.label}</span></div>
              <button type="button" onClick={() => setResetKey((k) => k + 1)} className="text-sm text-bone underline decoration-titanium/50 underline-offset-8 transition-colors hover:decoration-ice">Reset view</button>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 text-sm text-titanium md:px-12">
          <p>Hero prototype. Remaining sections follow after approval. AURA ONE is a fictional concept.</p>
          <div id="product" /><div id="experience" /><div id="specifications" />
        </section>
      </main>
    </div>
  )
}
