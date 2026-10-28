import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Rig, createView } from './Rig'
import { DragSurface } from './DragSurface'
import { Studio } from './Studio'
import { Poster } from './Poster'
import { ProceduralHeadphone } from './ProceduralHeadphone'
import type { Finish, ProductModel } from './finishes'

interface Props { finish: Finish; Model?: ProductModel; still?: boolean; resetKey?: number }

const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }

/** Reusable 3D hero. Fills its (relatively positioned) parent. Swap `Model` to change the product. */
export default function AuraHero({ finish, Model = ProceduralHeadphone, still = false, resetKey = 0 }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const view = useRef(createView())
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const webgl = useMemo(hasWebGL, [])

  useEffect(() => { if (resetKey) view.current.resetting = true }, [resetKey])

  useEffect(() => {
    const el = wrap.current?.parentElement
    if (!el) return
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = el.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      pointer.current = inside ? { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) } : { x: 0, y: 0 }
    }
    const leave = () => { pointer.current = { x: 0, y: 0 } }
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting))
    io.observe(el)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    return () => { io.disconnect(); window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('mouseleave', leave) }
  }, [])

  if (!webgl) return <Poster />
  return (
    <div ref={wrap} className="absolute inset-0 z-10 select-none" style={{ touchAction: 'pan-y' }}>
      <Poster className={`transition-opacity duration-1000 ${ready ? 'opacity-0' : 'opacity-100'}`} />
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ fov: 26, position: [0, 0, 11] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: still }}
        aria-label={`AURA ONE headphones in ${finish.label}`}
        onCreated={() => { setTimeout(() => { setReady(true); if (still) document.body.dataset.ready = '1' }, still ? 900 : 250) }}
      >
        <Studio pointer={pointer} />
        <Rig pointer={pointer} view={view} still={still}><DragSurface view={view}><Model finish={finish} /></DragSurface></Rig>
      </Canvas>
    </div>
  )
}
