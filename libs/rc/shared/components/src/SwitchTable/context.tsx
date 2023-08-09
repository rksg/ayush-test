import { createContext } from 'react'

export const SwitchTabContext = createContext({} as {
  setSwitchCount: (data: number) => void
})