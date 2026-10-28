import { useMemo, useRef, type MutableRefObject, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils as M, type Group } from 'three'
import { useReducedMotion } from './useReducedMotion'

export type Pointer = MutableRefObject<{ x: number; y: number }>

/** User-controlled orientation. Written ONLY by DragSurface (and the reset button via `resetting`); read by Rig. */
export interface View { yaw: number; pitch: number; vy: number; vp: number; dragging: boolean; resetting: boolean; normalized: boolean; lastMove: number }
export const createView = (): View => ({ yaw: 0, pitch: 0, vy: 0, vp: 0, dragging: false, resetting: false, normalized: false, lastMove: 0 })

/** ───── Tuning panel ───── */
export const MOTION = {
  // MOUSE-FOLLOW (subtle layer on top of the user's angle), degrees each way
  maxYaw: 30,
  maxPitch: 20,
  sensitivity: 1.2,   // pointer gain, clamped
  inputSmoothing: 5,  // stage 1 (higher = faster)
  follow: 3.5,        // stage 2 (higher = faster)
  // IDLE FLOAT
  floatAmp: 0.08, floatSpeed: 0.9, rollAmp: 0.02, driftYaw: 0.03,
  // MOBILE / TOUCH auto sway (fraction of the follow range)
  sway: { yaw: 0.35, pitch: 0.25, yawSpeed: 0.35, pitchSpeed: 0.27 },
  // RESTING POSE
  baseYaw: -0.42, basePitch: 0.05,
  // DRAG
  drag: {
    yawPerPx: 0.009,    // radians per pixel → 360° ≈ 700 px of horizontal drag
    pitchPerPx: 0.006,  // radians per pixel
    pitchLimit: 35,     // degrees, vertical tilt limit of the user's angle
    friction: 3.2,      // inertia after release: higher = stops sooner
    maxSpeed: 12,       // rad/s cap on release velocity
    resetSpeed: 5,      // higher = faster "Reset view"
  },
}

const wrap = (a: number) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2))

/**
 * The only component that writes the model's rotation. Every frame it composes:
 *   base pose + user angle (view) + mouse-follow offset + idle drift
 * Drag and follow live in separate state, so neither can overwrite the other.
 */
export function Rig({ pointer, view, still = false, children }: { pointer: Pointer; view: MutableRefObject<View>; still?: boolean; children: ReactNode }) {
  const ref = useRef<Group>(null)
  const input = useRef({ x: 0, y: 0 })   // follow stage 1
  const follow = useRef({ yaw: 0, pitch: 0 }) // follow stage 2 (what is actually added)
  const reduced = useReducedMotion()
  const coarse = useMemo(() => matchMedia('(pointer: coarse)').matches, [])
  const c = MOTION, d = c.drag
  const yawRange = M.degToRad(c.maxYaw), pitchRange = M.degToRad(c.maxPitch), limit = M.degToRad(d.pitchLimit)

  useFrame(({ clock }, rawDt) => {
    const o = ref.current
    if (!o) return
    const dt = Math.min(rawDt, 0.05)
    const t = clock.elapsedTime
    const v = view.current

    // 1) user orientation: drag is applied by DragSurface; here only inertia and reset
    if (!v.dragging) {
      if (v.resetting) {
        if (reduced) { v.yaw = 0; v.pitch = 0; v.resetting = false }
        else {
          if (!v.normalized) { v.yaw = wrap(v.yaw); v.normalized = true } // shortest way back
          v.vy = v.vp = 0
          v.yaw = M.damp(v.yaw, 0, d.resetSpeed, dt); v.pitch = M.damp(v.pitch, 0, d.resetSpeed, dt)
          if (Math.abs(v.yaw) < 1e-3 && Math.abs(v.pitch) < 1e-3) { v.yaw = 0; v.pitch = 0; v.resetting = false; v.normalized = false }
        }
      } else if (!reduced && (v.vy || v.vp)) {
        v.yaw += v.vy * dt
        v.pitch += v.vp * dt
        if (Math.abs(v.pitch) >= limit) { v.pitch = M.clamp(v.pitch, -limit, limit); v.vp = 0 }
        const k = Math.exp(-d.friction * dt)
        v.vy *= k; v.vp *= k
        if (Math.abs(v.vy) < 0.01) v.vy = 0
        if (Math.abs(v.vp) < 0.01) v.vp = 0
      }
    }

    // 2) subtle mouse-follow / sway / float — switched off (smoothly) while the user drags
    const live = !reduced && !still && !v.dragging
    let rx = 0, ry = 0, floatY = 0, roll = 0, drift = 0
    if (live) {
      if (coarse) { rx = Math.sin(t * c.sway.yawSpeed) * c.sway.yaw; ry = Math.sin(t * c.sway.pitchSpeed) * c.sway.pitch }
      else { rx = M.clamp(pointer.current.x * c.sensitivity, -1, 1); ry = M.clamp(pointer.current.y * c.sensitivity, -1, 1) }
    }
    if (!reduced && !still) {
      floatY = Math.sin(t * c.floatSpeed) * c.floatAmp
      roll = Math.sin(t * c.floatSpeed * 0.6) * c.rollAmp
      drift = v.dragging ? 0 : Math.sin(t * 0.4) * c.driftYaw
    }
    input.current.x = M.damp(input.current.x, rx, c.inputSmoothing, dt)
    input.current.y = M.damp(input.current.y, ry, c.inputSmoothing, dt)
    follow.current.yaw = M.damp(follow.current.yaw, input.current.x * yawRange + drift, c.follow, dt)
    follow.current.pitch = M.damp(follow.current.pitch, -input.current.y * pitchRange, c.follow, dt)

    // 3) compose and write (single writer)
    o.rotation.y = c.baseYaw + v.yaw + follow.current.yaw
    o.rotation.x = c.basePitch - v.pitch + follow.current.pitch
    o.rotation.z = M.damp(o.rotation.z, roll, 2, dt)
    o.position.y = M.damp(o.position.y, floatY, 2, dt)
  })

  return <group ref={ref} rotation={[c.basePitch, c.baseYaw, 0]}>{children}</group>
}
