import { createContext } from 'react'

export interface TopologyTreeType {
  scale: number
}

export const TopologyTreeContext = createContext({} as TopologyTreeType)

