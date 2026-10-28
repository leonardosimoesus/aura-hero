import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ProductModelProps } from './finishes'

/**
 * Drop-in replacement for <ProceduralHeadphone />.
 * Name the materials in Blender AURA_Shell / AURA_Trim / AURA_Pad and finishes apply automatically.
 * Usage: <AuraHero Model={(p) => <GlbHeadphone url="/models/aura-one.glb" {...p} />} />
 */
export function GlbHeadphone({ url, finish }: ProductModelProps & { url: string }) {
  const { scene } = useGLTF(url)
  const root = useMemo(() => scene.clone(true), [scene])
  useEffect(() => {
    root.traverse((o) => {
      const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (!mat) return
      if (mat.name === 'AURA_Shell') { mat.color.set(finish.shell); mat.metalness = finish.metalness; mat.roughness = finish.roughness }
      if (mat.name === 'AURA_Trim') mat.color.set(finish.trim)
      if (mat.name === 'AURA_Pad') mat.color.set(finish.pad)
    })
  }, [root, finish])
  return <primitive object={root} />
}
