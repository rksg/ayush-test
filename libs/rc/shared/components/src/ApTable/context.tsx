import { createContext } from 'react'

export const ApsTabContext = createContext({} as {
  setApsCount: (data: number) => void
})
