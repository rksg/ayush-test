import { createContext } from 'react'

export interface TopologyTreeType {
  scale: number
  translate: number[]
}

export const TopologyTreeContext = createContext({} as TopologyTreeType)

