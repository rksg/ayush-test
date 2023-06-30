import { createContext } from 'react'

export const ClientTabContext = createContext({} as {
  setClientCount: (data: number) => void
})
