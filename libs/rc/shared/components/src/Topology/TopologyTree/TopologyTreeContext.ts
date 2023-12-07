import { createContext } from 'react'

export interface TopologyTreeType {
  scale: number
  translate: number[]
  setTranslate: (data: number[]) => void
}

export const TopologyTreeContext = createContext({} as TopologyTreeType)

