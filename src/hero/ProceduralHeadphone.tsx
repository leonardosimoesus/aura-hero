import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { ProductModelProps } from './finishes'

/* Units ≈ 10 cm. Over-ear, oval cups, flat headband, yoke arms. Cup axis = local Y, then rotated onto world X. */
const V = (x: number, y: number) => new THREE.Vector3(x, y, 0)
const arch = (a: number, b: number, t0: number, t1: number, n = 64) =>
  new THREE.CatmullRomCurve3(Array.from({ length: n + 1 }, (_, i) => { const t = t0 + ((t1 - t0) * i) / n; return V(a * Math.cos(t), 0.3 + b * Math.sin(t)) }))

function buildGeometry() {
  const shellProfile = new THREE.SplineCurve([[0.46, 0], [0.58, 0.015], [0.645, 0.08], [0.655, 0.2], [0.62, 0.3], [0.52, 0.352], [0.36, 0.368], [0, 0.37]].map(([x, y]) => new THREE.Vector2(x, y))).getPoints(56)
  return {
    band: new THREE.TubeGeometry(arch(1.22, 1.55, 0, Math.PI), 120, 0.05, 14),
    bandPad: new THREE.TubeGeometry(arch(1.14, 1.47, Math.PI * 0.3, Math.PI * 0.7, 40), 60, 0.065, 14),
    arm: new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(1.22, 0.3), V(1.29, 0), V(1.4, -0.3), V(1.44, -0.74)]), 40, 0.045, 12),
    shell: new THREE.LatheGeometry(shellProfile, 72),
    cushion: new THREE.TorusGeometry(0.52, 0.14, 28, 72),
    foam: new THREE.CircleGeometry(0.46, 48),
    cap: new THREE.CylinderGeometry(0.4, 0.4, 0.03, 64),
    capRing: new THREE.TorusGeometry(0.43, 0.018, 12, 128),
    glow: new THREE.TorusGeometry(0.405, 0.005, 8, 128),
    sleeve: new THREE.CylinderGeometry(0.075, 0.075, 0.22, 24),
    hub: new THREE.CylinderGeometry(0.1, 0.1, 0.07, 32),
  }
}

type Geo = ReturnType<typeof buildGeometry>
type Mats = { shell: THREE.Material; trim: THREE.Material; pad: THREE.Material; foam: THREE.Material; glow: THREE.Material }

function Side({ g, m }: { g: Geo; m: Mats }) {
  return (
    <group>
      <mesh geometry={g.arm} material={m.trim} scale={[1, 1, 2]} />
      <mesh geometry={g.sleeve} material={m.trim} position={[1.22, 0.2, 0]} scale={[1, 1, 2.6]} />
      <mesh geometry={g.hub} material={m.trim} position={[1.44, -0.75, 0]} rotation={[0, 0, Math.PI / 2]} />
      <group position={[1.03, -0.75, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <group scale={[1.12, 1, 0.9]}>
          <mesh geometry={g.shell} material={m.shell} />
          <mesh geometry={g.cap} material={m.trim} position={[0, 0.384, 0]} />
          <mesh geometry={g.capRing} material={m.trim} position={[0, 0.376, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={g.glow} material={m.glow} position={[0, 0.401, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={g.cushion} material={m.pad} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.9]} />
          <mesh geometry={g.foam} material={m.foam} position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      </group>
    </group>
  )
}

export function ProceduralHeadphone({ finish }: ProductModelProps) {
  const g = useMemo(buildGeometry, [])
  const m = useMemo<Mats>(() => ({
    shell: new THREE.MeshPhysicalMaterial({ color: finish.shell, metalness: finish.metalness, roughness: finish.roughness, clearcoat: 0.5, clearcoatRoughness: 0.2 }),
    trim: new THREE.MeshStandardMaterial({ color: finish.trim, metalness: 1, roughness: 0.25 }),
    pad: new THREE.MeshPhysicalMaterial({ color: finish.pad, roughness: 0.62, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(finish.padSheen) }),
    foam: new THREE.MeshStandardMaterial({ color: '#060607', roughness: 1 }),
    glow: new THREE.MeshBasicMaterial({ color: '#8BAFC5', toneMapped: false }),
  }), [finish])

  useEffect(() => () => { Object.values(m).forEach((x) => x.dispose()) }, [m])
  useEffect(() => () => { Object.values(g).forEach((x) => x.dispose()) }, [g])

  return (
    <group position={[0, -0.15, 0]}>
      <mesh geometry={g.band} material={m.shell} scale={[1, 1, 5.5]} />
      <mesh geometry={g.bandPad} material={m.pad} scale={[1, 1, 5.2]} />
      <Side g={g} m={m} />
      <group scale={[-1, 1, 1]}><Side g={g} m={m} /></group>
    </group>
  )
}
