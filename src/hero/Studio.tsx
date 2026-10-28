import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { MathUtils as M, type SpotLight } from 'three'
import type { Pointer } from './Rig'

/** Camera + lighting only. Soft boxes are procedural (no HDR download); one spot follows the cursor. */
export function Studio({ pointer }: { pointer: Pointer }) {
  const spot = useRef<SpotLight>(null)
  const { size, camera } = useThree()

  // Fit: keep ≥1.85 units of half-width visible so the model never clips at full rotation (narrow screens pull back).
  useEffect(() => { camera.position.z = Math.max(11, 1.85 / (Math.tan(M.degToRad(13)) * (size.width / size.height))); camera.updateProjectionMatrix() }, [size.width, size.height, camera])

  useFrame((_, dt) => {
    const s = spot.current
    if (!s) return
    s.position.x = M.damp(s.position.x, pointer.current.x * 3.2 - 1.5, 3, dt)
    s.position.y = M.damp(s.position.y, 3.5 + pointer.current.y * 1.6, 3, dt)
  })

  const aim = (o: { lookAt: (x: number, y: number, z: number) => void }) => o.lookAt(0, 0, 0)
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[-4, 4, 3]} scale={[6, 4, 1]} onUpdate={aim} />
        <Lightformer form="rect" intensity={3} color="#bcd6e6" position={[5, 1, -2]} scale={[1.2, 7, 1]} onUpdate={aim} />
        <Lightformer form="rect" intensity={2} position={[0, 6, 0]} scale={[8, 2, 1]} onUpdate={aim} />
        <Lightformer form="ring" intensity={0.6} position={[0, -5, 2]} scale={6} onUpdate={aim} />
      </Environment>
      <spotLight ref={spot} position={[-1.5, 3.5, 6]} angle={0.45} penumbra={1} intensity={90} decay={2} color="#e6eef4" />
      <pointLight position={[3.5, 0.5, -3]} intensity={14} color="#8BAFC5" />
    </>
  )
}
