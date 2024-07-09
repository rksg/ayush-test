import { createContext } from 'react'

export interface TopologyTreeType {
  scale: number
  translate: number[]
  setTranslate: (data: number[]) => void
  onDrag: boolean
  setOnDrag: (data: boolean) => void
  selectedNode: string
  selectedVlanPortList: string[]
}

export const TopologyTreeContext = createContext({} as TopologyTreeType)

