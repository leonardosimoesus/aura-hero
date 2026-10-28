import { useEffect, useRef, type MutableRefObject, type ReactNode } from 'react'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { MathUtils as M } from 'three'
import { MOTION, type View } from './Rig'

/**
 * Pointer-driven rotation. Writes ONLY to `view` (never to the mesh).
 * - pointerdown is raycast against the headphone (plus an invisible hit volume so thin parts like the band are easy to grab)
 * - move / up / cancel use native events on the canvas with pointer capture, so the drag survives leaving the model
 */
export function DragSurface({ view, children }: { view: MutableRefObject<View>; children: ReactNode }) {
  const el = useThree((s) => s.gl.domElement)
  const hover = useRef(false)
  const last = useRef({ x: 0, y: 0, t: 0, id: -1 })
  const d = MOTION.drag

  useEffect(() => {
    const v = view.current
    const limit = M.degToRad(d.pitchLimit)
    const move = (e: PointerEvent) => {
      if (!v.dragging || e.pointerId !== last.current.id) return
      const dt = Math.max((e.timeStamp - last.current.t) / 1000, 0.001)
      const dyaw = (e.clientX - last.current.x) * d.yawPerPx
      const dpitch = (e.clientY - last.current.y) * d.pitchPerPx
      last.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, id: e.pointerId }
      v.yaw += dyaw
      v.pitch = M.clamp(v.pitch + dpitch, -limit, limit)
      v.vy = M.clamp(M.lerp(v.vy, dyaw / dt, 0.4), -d.maxSpeed, d.maxSpeed)
      v.vp = M.clamp(M.lerp(v.vp, dpitch / dt, 0.4), -d.maxSpeed, d.maxSpeed)
      v.lastMove = e.timeStamp
    }
    const end = (e: PointerEvent) => {
      if (!v.dragging || e.pointerId !== last.current.id) return
      v.dragging = false
      try { if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId) } catch { /* pointer already gone */ }
      if (e.timeStamp - v.lastMove > 90) { v.vy = 0; v.vp = 0 } // paused before release → no fling
      el.style.cursor = hover.current ? 'grab' : ''
    }
    const names = ['pointerup', 'pointercancel', 'lostpointercapture'] as const
    el.addEventListener('pointermove', move)
    names.forEach((n) => el.addEventListener(n, end))
    return () => { el.removeEventListener('pointermove', move); names.forEach((n) => el.removeEventListener(n, end)); el.style.cursor = '' }
  }, [el, view, d])

  const down = (e: ThreeEvent<PointerEvent>) => {
    const n = e.nativeEvent
    if (n.pointerType === 'mouse' && n.button !== 0) return // left button only
    e.stopPropagation()
    try { el.setPointerCapture(n.pointerId) } catch { /* unsupported */ }
    const v = view.current
    v.dragging = true; v.resetting = false; v.normalized = false; v.vy = 0; v.vp = 0; v.lastMove = n.timeStamp
    last.current = { x: n.clientX, y: n.clientY, t: n.timeStamp, id: n.pointerId }
    el.style.cursor = 'grabbing'
  }

  return (
    <group
      onPointerDown={down}
      onPointerOver={() => { hover.current = true; if (!view.current.dragging) el.style.cursor = 'grab' }}
      onPointerOut={() => { hover.current = false; if (!view.current.dragging) el.style.cursor = '' }}
    >
      {children}
      <mesh>
        <boxGeometry args={[3.5, 3.7, 1.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
