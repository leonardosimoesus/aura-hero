import type { ComponentType } from 'react'

export type FinishId = 'midnight' | 'titanium' | 'arctic'

export interface Finish {
  id: FinishId
  label: string
  shell: string
  metalness: number
  roughness: number
  trim: string
  pad: string
  padSheen: string
}

export const FINISHES: Record<FinishId, Finish> = {
  midnight: { id: 'midnight', label: 'Midnight Black', shell: '#14161a', metalness: 0.85, roughness: 0.36, trim: '#9aa1aa', pad: '#0d0e10', padSheen: '#3a3f47' },
  titanium: { id: 'titanium', label: 'Titanium Silver', shell: '#a9b0b9', metalness: 1, roughness: 0.3, trim: '#d3d8de', pad: '#1b1d21', padSheen: '#4a505a' },
  arctic: { id: 'arctic', label: 'Arctic White', shell: '#e8e8e5', metalness: 0.15, roughness: 0.32, trim: '#b8bec5', pad: '#d9d9d5', padSheen: '#ffffff' },
}

/** Contract every product model (procedural or GLB) must satisfy. The Hero never knows which one it renders. */
export interface ProductModelProps { finish: Finish }
export type ProductModel = ComponentType<ProductModelProps>
