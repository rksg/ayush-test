import { createContext } from 'react'

export const NetworkTabContext = createContext({} as {
  setNetworkCount: (data: number) => void
})
