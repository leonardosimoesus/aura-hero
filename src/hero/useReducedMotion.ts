import { useSyncExternalStore } from 'react'

const q = '(prefers-reduced-motion: reduce)'
const sub = (cb: () => void) => { const m = matchMedia(q); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) }
export const useReducedMotion = () => useSyncExternalStore(sub, () => matchMedia(q).matches, () => false)
