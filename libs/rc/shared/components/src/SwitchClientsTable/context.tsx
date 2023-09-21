import { createContext } from 'react'

export const SwitchClientContext = createContext({} as {
  setSwitchCount: (data: number) => void
  tableQueryFilters?: {
    venueId?: string[]
    switchId?: string[]
  }
  setTableQueryFilters: (data: {
    venueId?: string[]
    switchId?: string[]
  }) => void
})
