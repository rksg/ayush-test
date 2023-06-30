import { createContext } from 'react'

export const SwitchClientContext = createContext({} as {
  setSwitchCount: (data: number) => void
})
